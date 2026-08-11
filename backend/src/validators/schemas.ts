import { z } from "zod";
import { CustomerStatus, CustomerType, ChallanStatus } from "@prisma/client";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const customerSchema = z.object({
  customerName: z.string().min(1),
  mobileNumber: z.string().min(7),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  businessName: z.string().min(1),
  gstNumber: z.string().optional().or(z.literal("")).nullable(),
  customerType: z.nativeEnum(CustomerType),
  address: z.string().min(1),
  status: z.nativeEnum(CustomerStatus).optional(),
  followUpDate: z.string().datetime().optional().nullable().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")).nullable(),
});

export const followUpSchema = z.object({
  note: z.string().min(1),
  followUpDate: z.string().datetime().optional().nullable().or(z.literal("")),
});

export const productSchema = z.object({
  productName: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().min(1),
  unitPrice: z.number().nonnegative(),
  currentStock: z.number().int().min(0).optional(),
  minimumStockAlertQuantity: z.number().int().min(0).optional(),
  warehouseLocation: z.string().min(1),
});

export const productUpdateSchema = productSchema.omit({ currentStock: true });

export const stockInSchema = z.object({
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
});

export const challanItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export const createChallanSchema = z.object({
  customerId: z.string().min(1),
  items: z.array(challanItemSchema).min(1),
  status: z.enum([ChallanStatus.DRAFT, ChallanStatus.CONFIRMED]).default(ChallanStatus.DRAFT),
});
