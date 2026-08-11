import { MovementType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { productRepository, stockRepository } from "../repositories";
import { ConflictError, NotFoundError, ValidationError } from "../utils/errors";

function parsePage(query: { page?: string; limit?: string }) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit };
}

function withLowStockFlag(product: { currentStock: number; minimumStockAlertQuantity: number; unitPrice: unknown; [key: string]: unknown }) {
  return {
    ...product,
    unitPrice: Number(product.unitPrice as unknown as number),
    isLowStock: product.currentStock <= product.minimumStockAlertQuantity,
  };
}

export const productService = {
  async list(query: Record<string, string | undefined>) {
    const { page, limit } = parsePage(query);
    const search = (query.search || "").trim();
    const lowStock = query.lowStock === "true";

    const where: Prisma.ProductWhereInput = {};
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { warehouseLocation: { contains: search, mode: "insensitive" } },
      ];
    }

    if (lowStock) {
      const all = await productRepository.findAllMatching(where);
      const filtered = all.filter((p) => p.currentStock <= p.minimumStockAlertQuantity);
      const total = filtered.length;
      const items = filtered.slice((page - 1) * limit, page * limit).map(withLowStockFlag);
      return {
        items,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      };
    }

    const [total, rows] = await Promise.all([
      productRepository.count(where),
      productRepository.findMany(where, page, limit),
    ]);

    return {
      items: rows.map(withLowStockFlag),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return withLowStockFlag(product);
  },

  async create(
    body: {
      productName: string;
      sku: string;
      category: string;
      unitPrice: number;
      currentStock?: number;
      minimumStockAlertQuantity?: number;
      warehouseLocation: string;
    },
    userId: string
  ) {
    const existing = await productRepository.findBySku(body.sku);
    if (existing) throw new ConflictError("SKU already exists");

    const initialStock = body.currentStock ?? 0;

    return prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          productName: body.productName,
          sku: body.sku,
          category: body.category,
          unitPrice: body.unitPrice,
          currentStock: initialStock,
          minimumStockAlertQuantity: body.minimumStockAlertQuantity ?? 0,
          warehouseLocation: body.warehouseLocation,
        },
      });

      if (initialStock > 0) {
        await tx.stockMovement.create({
          data: {
            productId: created.id,
            quantityChanged: initialStock,
            movementType: MovementType.IN,
            reason: "Initial stock",
            createdById: userId,
          },
        });
      }

      return withLowStockFlag(created);
    });
  },

  async update(
    id: string,
    body: {
      productName: string;
      sku: string;
      category: string;
      unitPrice: number;
      minimumStockAlertQuantity?: number;
      warehouseLocation: string;
    }
  ) {
    const existing = await productRepository.findById(id);
    if (!existing) throw new NotFoundError("Product not found");

    if (body.sku !== existing.sku) {
      const skuTaken = await productRepository.findBySku(body.sku);
      if (skuTaken) throw new ConflictError("SKU already exists");
    }

    const updated = await productRepository.update(id, {
      productName: body.productName,
      sku: body.sku,
      category: body.category,
      unitPrice: body.unitPrice,
      minimumStockAlertQuantity: body.minimumStockAlertQuantity ?? existing.minimumStockAlertQuantity,
      warehouseLocation: body.warehouseLocation,
    });

    return withLowStockFlag(updated);
  },

  async stockIn(id: string, userId: string, quantity: number, reason: string) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new ValidationError("Quantity must be a positive integer");
    }

    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: { currentStock: { increment: quantity } },
      });

      const movement = await tx.stockMovement.create({
        data: {
          productId: id,
          quantityChanged: quantity,
          movementType: MovementType.IN,
          reason,
          createdById: userId,
        },
        include: { createdBy: { select: { id: true, name: true, role: true } } },
      });

      return { product: withLowStockFlag(updated), movement };
    });

    return result;
  },

  async listStockMovements(productId: string, query: Record<string, string | undefined>) {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError("Product not found");

    const { page, limit } = parsePage(query);
    const [total, items] = await stockRepository.listByProduct(productId, page, limit);
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async listAllMovements(query: Record<string, string | undefined>) {
    const { page, limit } = parsePage({ ...query, limit: query.limit || "20" });
    const [total, items] = await stockRepository.listAll(page, limit);
    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },
};
