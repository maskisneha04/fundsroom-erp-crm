import { ChallanStatus, MovementType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { challanRepository, customerRepository, productRepository } from "../repositories";
import { AppError, NotFoundError, ValidationError } from "../utils/errors";
import { logger } from "../utils/logger";

function parsePage(query: { page?: string; limit?: string }) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit };
}

async function nextChallanNumber(tx: Prisma.TransactionClient) {
  const latest = await tx.challan.findFirst({
    where: { challanNumber: { startsWith: "SC-" } },
    orderBy: { challanNumber: "desc" },
  });
  const next = latest ? Number(latest.challanNumber.split("-")[1]) + 1 : 1;
  return `SC-${String(next).padStart(6, "0")}`;
}

function serializeChallan<T extends { items: Array<{ unitPrice: unknown }> }>(challan: T) {
  return {
    ...challan,
    items: challan.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice as number),
    })),
  };
}

export const challanService = {
  async list(query: Record<string, string | undefined>) {
    const { page, limit } = parsePage(query);
    const search = (query.search || "").trim();
    const status = query.status;
    const customerId = query.customerId;

    const where: Prisma.ChallanWhereInput = {};
    if (search) {
      where.OR = [
        { challanNumber: { contains: search, mode: "insensitive" } },
        { customer: { customerName: { contains: search, mode: "insensitive" } } },
        { customer: { businessName: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (status && Object.values(ChallanStatus).includes(status as ChallanStatus)) {
      where.status = status as ChallanStatus;
    }
    if (customerId) where.customerId = customerId;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    const [total, items] = await Promise.all([
      challanRepository.count(where),
      challanRepository.findMany(where, page, limit),
    ]);

    return {
      items: items.map(serializeChallan),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(id: string) {
    const challan = await challanRepository.findById(id);
    if (!challan) throw new NotFoundError("Challan not found");
    return serializeChallan(challan);
  },

  async create(
    userId: string,
    body: {
      customerId: string;
      items: Array<{ productId: string; quantity: number }>;
      status: "DRAFT" | "CONFIRMED";
    }
  ) {
    const customer = await customerRepository.findById(body.customerId);
    if (!customer) throw new NotFoundError("Customer not found");

    const productIds = body.items.map((i) => i.productId);
    const products = await productRepository.findByIds(productIds);
    if (products.length !== new Set(productIds).size) {
      throw new ValidationError("One or more products were not found");
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    if (body.status === ChallanStatus.CONFIRMED) {
      for (const item of body.items) {
        const product = productMap.get(item.productId)!;
        if (product.currentStock < item.quantity) {
          throw new AppError(`Insufficient stock for product ${product.productName}`, 400, {
            data: {
              availableStock: product.currentStock,
              requestedQuantity: item.quantity,
              productName: product.productName,
              sku: product.sku,
            },
          });
        }
      }
    }

    const challan = await prisma.$transaction(async (tx) => {
      if (body.status === ChallanStatus.CONFIRMED) {
        for (const item of body.items) {
          const locked = await tx.product.findUnique({ where: { id: item.productId } });
          if (!locked || locked.currentStock < item.quantity) {
            throw new AppError(
              `Insufficient stock for product ${locked?.productName || item.productId}`,
              400,
              {
                data: {
                  availableStock: locked?.currentStock ?? 0,
                  requestedQuantity: item.quantity,
                  productName: locked?.productName,
                },
              }
            );
          }
        }
      }

      const challanNumber = await nextChallanNumber(tx);
      const totalQuantity = body.items.reduce((sum, i) => sum + i.quantity, 0);

      const created = await tx.challan.create({
        data: {
          challanNumber,
          customerId: body.customerId,
          totalQuantity,
          status: body.status,
          createdById: userId,
          items: {
            create: body.items.map((item) => {
              const product = productMap.get(item.productId)!;
              return {
                productId: product.id,
                productName: product.productName,
                sku: product.sku,
                unitPrice: product.unitPrice,
                quantity: item.quantity,
              };
            }),
          },
        },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, role: true } },
          items: true,
        },
      });

      if (body.status === ChallanStatus.CONFIRMED) {
        for (const item of body.items) {
          const updated = await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });
          if (updated.currentStock < 0) {
            throw new AppError("Stock cannot go negative", 409);
          }
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan ${challanNumber}`,
              createdById: userId,
            },
          });
        }
      }

      return created;
    });

    return serializeChallan(challan);
  },

  async confirm(id: string, userId: string) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const challan = await tx.challan.findUnique({
          where: { id },
          include: { items: true },
        });
        if (!challan) throw new NotFoundError("Challan not found");
        if (challan.status !== ChallanStatus.DRAFT) {
          throw new ValidationError(
            `Only draft challans can be confirmed. Current status: ${challan.status}`
          );
        }

        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            throw new NotFoundError(`Product missing for item ${item.sku}`);
          }
          if (product.currentStock < item.quantity) {
            throw new AppError(`Insufficient stock for product ${product.productName}`, 400, {
              data: {
                availableStock: product.currentStock,
                requestedQuantity: item.quantity,
                productName: product.productName,
                sku: product.sku,
              },
            });
          }
        }

        for (const item of challan.items) {
          const updated = await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });
          if (updated.currentStock < 0) {
            throw new AppError("Stock cannot go negative", 409);
          }
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantityChanged: item.quantity,
              movementType: MovementType.OUT,
              reason: `Sales Challan ${challan.challanNumber}`,
              createdById: userId,
            },
          });
        }

        return tx.challan.update({
          where: { id },
          data: { status: ChallanStatus.CONFIRMED },
          include: {
            customer: true,
            createdBy: { select: { id: true, name: true, role: true } },
            items: true,
          },
        });
      });

      return serializeChallan(result);
    } catch (err) {
      logger.warn("Challan confirmation failed", { challanId: id, error: (err as Error).message });
      throw err;
    }
  },

  async cancel(id: string) {
    const challan = await challanRepository.findById(id);
    if (!challan) throw new NotFoundError("Challan not found");

    if (challan.status !== ChallanStatus.DRAFT) {
      throw new ValidationError(
        `Only draft challans can be cancelled. Confirmed challans cannot be cancelled.`
      );
    }

    const updated = await prisma.challan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, role: true } },
        items: true,
      },
    });

    return serializeChallan(updated);
  },
};
