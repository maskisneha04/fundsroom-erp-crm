import { ChallanStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

export const dashboardService = {
  async summary() {
    const [
      totalCustomers,
      totalProducts,
      products,
      totalChallans,
      draftChallans,
      confirmedChallans,
      recentChallans,
      recentFollowUps,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.product.findMany({
        select: {
          id: true,
          productName: true,
          sku: true,
          currentStock: true,
          minimumStockAlertQuantity: true,
        },
      }),
      prisma.challan.count(),
      prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
      prisma.challan.count({ where: { status: ChallanStatus.CONFIRMED } }),
      prisma.challan.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { customerName: true, businessName: true } },
        },
      }),
      prisma.followUpNote.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { id: true, customerName: true, businessName: true } },
          createdBy: { select: { name: true } },
        },
      }),
    ]);

    const lowStockProductsList = products.filter(
      (p) => p.currentStock <= p.minimumStockAlertQuantity
    );

    return {
      totalCustomers,
      totalProducts,
      lowStockProducts: lowStockProductsList.length,
      totalChallans,
      draftChallans,
      confirmedChallans,
      lowStockItems: lowStockProductsList.slice(0, 5),
      recentChallans,
      recentFollowUps,
    };
  },
};
