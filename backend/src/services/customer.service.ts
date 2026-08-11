import { CustomerStatus, CustomerType, Prisma } from "@prisma/client";
import { customerRepository } from "../repositories";
import { NotFoundError } from "../utils/errors";

function parsePage(query: { page?: string; limit?: string }) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  return { page, limit };
}

export const customerService = {
  async list(query: Record<string, string | undefined>) {
    const { page, limit } = parsePage(query);
    const search = (query.search || "").trim();
    const status = query.status;
    const customerType = query.customerType;

    const where: Prisma.CustomerWhereInput = {};
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { mobileNumber: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
        { gstNumber: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status && Object.values(CustomerStatus).includes(status as CustomerStatus)) {
      where.status = status as CustomerStatus;
    }
    if (customerType && Object.values(CustomerType).includes(customerType as CustomerType)) {
      where.customerType = customerType as CustomerType;
    }

    const [total, items] = await Promise.all([
      customerRepository.count(where),
      customerRepository.findMany(where, page, limit),
    ]);

    return {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async getById(id: string) {
    const customer = await customerRepository.findById(id);
    if (!customer) throw new NotFoundError("Customer not found");
    return customer;
  },

  async create(body: {
    customerName: string;
    mobileNumber: string;
    email?: string | null;
    businessName: string;
    gstNumber?: string | null;
    customerType: CustomerType;
    address: string;
    status?: CustomerStatus;
    followUpDate?: string | null;
    notes?: string | null;
  }) {
    return customerRepository.create({
      customerName: body.customerName,
      mobileNumber: body.mobileNumber,
      email: body.email || null,
      businessName: body.businessName,
      gstNumber: body.gstNumber || null,
      customerType: body.customerType,
      address: body.address,
      status: body.status || CustomerStatus.LEAD,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      notes: body.notes || null,
    });
  },

  async update(
    id: string,
    body: {
      customerName: string;
      mobileNumber: string;
      email?: string | null;
      businessName: string;
      gstNumber?: string | null;
      customerType: CustomerType;
      address: string;
      status?: CustomerStatus;
      followUpDate?: string | null;
      notes?: string | null;
    }
  ) {
    const existing = await customerRepository.findById(id);
    if (!existing) throw new NotFoundError("Customer not found");

    return customerRepository.update(id, {
      customerName: body.customerName,
      mobileNumber: body.mobileNumber,
      email: body.email || null,
      businessName: body.businessName,
      gstNumber: body.gstNumber || null,
      customerType: body.customerType,
      address: body.address,
      status: body.status || existing.status,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      notes: body.notes || null,
    });
  },

  async addFollowUp(
    id: string,
    createdById: string,
    body: { note: string; followUpDate?: string | null }
  ) {
    const existing = await customerRepository.findById(id);
    if (!existing) throw new NotFoundError("Customer not found");

    const [followUp] = await customerRepository.addFollowUp(
      id,
      body.note,
      createdById,
      body.followUpDate ? new Date(body.followUpDate) : undefined
    );
    return followUp;
  },
};
