import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });
  },
};

export const customerRepository = {
  count(where: Prisma.CustomerWhereInput) {
    return prisma.customer.count({ where });
  },
  findMany(where: Prisma.CustomerWhereInput, page: number, limit: number) {
    return prisma.customer.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  },
  findById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        followUps: {
          orderBy: { createdAt: "desc" },
          include: { createdBy: { select: { id: true, name: true, role: true } } },
        },
        challans: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            challanNumber: true,
            status: true,
            totalQuantity: true,
            createdAt: true,
          },
        },
      },
    });
  },
  create(data: Prisma.CustomerCreateInput) {
    return prisma.customer.create({ data });
  },
  update(id: string, data: Prisma.CustomerUpdateInput) {
    return prisma.customer.update({ where: { id }, data });
  },
  addFollowUp(customerId: string, note: string, createdById: string, followUpDate?: Date | null) {
    return prisma.$transaction([
      prisma.followUpNote.create({
        data: { customerId, note, createdById },
        include: { createdBy: { select: { id: true, name: true, role: true } } },
      }),
      prisma.customer.update({
        where: { id: customerId },
        data: {
          notes: note,
          ...(followUpDate !== undefined ? { followUpDate } : {}),
        },
      }),
    ]);
  },
};

export const productRepository = {
  count(where: Prisma.ProductWhereInput) {
    return prisma.product.count({ where });
  },
  findMany(where: Prisma.ProductWhereInput, page: number, limit: number) {
    return prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });
  },
  findAllMatching(where: Prisma.ProductWhereInput) {
    return prisma.product.findMany({ where, orderBy: { updatedAt: "desc" } });
  },
  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },
  findBySku(sku: string) {
    return prisma.product.findUnique({ where: { sku } });
  },
  findByIds(ids: string[]) {
    return prisma.product.findMany({ where: { id: { in: ids } } });
  },
  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  },
  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },
};

export const stockRepository = {
  listByProduct(productId: string, page: number, limit: number) {
    return Promise.all([
      prisma.stockMovement.count({ where: { productId } }),
      prisma.stockMovement.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { createdBy: { select: { id: true, name: true, role: true } } },
      }),
    ]);
  },
  listAll(page: number, limit: number) {
    return Promise.all([
      prisma.stockMovement.count(),
      prisma.stockMovement.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: { select: { id: true, productName: true, sku: true } },
          createdBy: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);
  },
};

export const challanRepository = {
  count(where: Prisma.ChallanWhereInput) {
    return prisma.challan.count({ where });
  },
  findMany(where: Prisma.ChallanWhereInput, page: number, limit: number) {
    return prisma.challan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { id: true, customerName: true, businessName: true } },
        createdBy: { select: { id: true, name: true, role: true } },
        items: true,
      },
    });
  },
  findById(id: string) {
    return prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, role: true } },
        items: true,
      },
    });
  },
};
