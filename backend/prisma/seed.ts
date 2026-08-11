import bcrypt from "bcryptjs";
import {
  PrismaClient,
  Role,
  CustomerType,
  CustomerStatus,
  MovementType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function upsertUser(
  email: string,
  name: string,
  role: Role,
  password: string
) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, passwordHash },
    create: { email, name, role, passwordHash },
  });
}

async function main() {
  const admin = await upsertUser("admin@test.com", "Admin User", Role.ADMIN, "Admin@123");
  const sales = await upsertUser("sales@test.com", "Sales User", Role.SALES, "Sales@123");
  const warehouse = await upsertUser(
    "warehouse@test.com",
    "Warehouse User",
    Role.WAREHOUSE,
    "Warehouse@123"
  );
  await upsertUser("accounts@test.com", "Accounts User", Role.ACCOUNTS, "Accounts@123");

  // Clear transactional data for idempotent demo state
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.followUpNote.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        customerName: "Ravi Mehta",
        mobileNumber: "9876543210",
        email: "ravi@abcdistributors.com",
        businessName: "ABC Distributors",
        gstNumber: "27AAAAA0000A1Z5",
        customerType: CustomerType.WHOLESALE,
        address: "12 Industrial Estate, Pune",
        status: CustomerStatus.ACTIVE,
        followUpDate: new Date(Date.now() + 5 * 86400000),
        notes: "Preferred partner for monitors",
      },
    }),
    prisma.customer.create({
      data: {
        customerName: "Priya Shah",
        mobileNumber: "9123456780",
        email: "priya@retailhub.in",
        businessName: "Retail Hub",
        customerType: CustomerType.RETAIL,
        address: "45 SG Highway, Ahmedabad",
        status: CustomerStatus.LEAD,
        notes: "Interested in accessories",
      },
    }),
    prisma.customer.create({
      data: {
        customerName: "Amit Patel",
        mobileNumber: "9988776655",
        businessName: "West Distro Pvt Ltd",
        gstNumber: "24BBBBB0000B1Z5",
        customerType: CustomerType.DISTRIBUTOR,
        address: "Industrial Area, Surat",
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        customerName: "Neha Verma",
        mobileNumber: "9000012345",
        email: "neha@citymart.in",
        businessName: "City Mart",
        customerType: CustomerType.RETAIL,
        address: "MG Road, Indore",
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        customerName: "Karthik Rao",
        mobileNumber: "9811122233",
        email: "karthik@southsupply.in",
        businessName: "South Supply Co",
        gstNumber: "29CCCCC0000C1Z5",
        customerType: CustomerType.WHOLESALE,
        address: "Whitefield, Bengaluru",
        status: CustomerStatus.INACTIVE,
      },
    }),
  ]);

  const productDefs = [
    { productName: "Samsung Monitor", sku: "MON-001", category: "Displays", unitPrice: 12000, currentStock: 50, minimumStockAlertQuantity: 10, warehouseLocation: "Warehouse A - Rack 1" },
    { productName: "Logitech Keyboard", sku: "KB-1500", category: "Peripherals", unitPrice: 1500, currentStock: 80, minimumStockAlertQuantity: 20, warehouseLocation: "Warehouse A - Rack 2" },
    { productName: "Wireless Mouse", sku: "MS-200", category: "Peripherals", unitPrice: 799, currentStock: 120, minimumStockAlertQuantity: 30, warehouseLocation: "Warehouse A - Rack 2" },
    { productName: "USB-C Hub", sku: "HUB-4P", category: "Accessories", unitPrice: 2499, currentStock: 40, minimumStockAlertQuantity: 15, warehouseLocation: "Warehouse B - Bin 3" },
    { productName: "HDMI Cable 2m", sku: "CBL-HDMI-2", category: "Cables", unitPrice: 350, currentStock: 200, minimumStockAlertQuantity: 50, warehouseLocation: "Warehouse B - Bin 1" },
    { productName: "Laptop Stand", sku: "STND-LP", category: "Accessories", unitPrice: 1899, currentStock: 35, minimumStockAlertQuantity: 10, warehouseLocation: "Warehouse B - Bin 4" },
    { productName: "Webcam HD", sku: "CAM-HD", category: "Peripherals", unitPrice: 3200, currentStock: 25, minimumStockAlertQuantity: 8, warehouseLocation: "Warehouse A - Rack 3" },
    { productName: "A4 Copier Paper Ream", sku: "STN-A4-001", category: "Stationery", unitPrice: 320, currentStock: 150, minimumStockAlertQuantity: 40, warehouseLocation: "Warehouse C - Floor" },
    { productName: "Corrugated Carton Medium", sku: "PKG-CTN-M", category: "Packaging", unitPrice: 45, currentStock: 25, minimumStockAlertQuantity: 30, warehouseLocation: "Warehouse C - Floor" },
    { productName: "Thermal Label Roll", sku: "LBL-TH-80", category: "Packaging", unitPrice: 220, currentStock: 60, minimumStockAlertQuantity: 15, warehouseLocation: "Warehouse C - Shelf 2" },
  ];

  const products = [];
  for (const def of productDefs) {
    const product = await prisma.product.create({ data: def });
    products.push(product);
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantityChanged: product.currentStock,
        movementType: MovementType.IN,
        reason: "Opening stock / purchase received",
        createdById: warehouse.id,
      },
    });
  }

  await prisma.followUpNote.create({
    data: {
      customerId: customers[1].id,
      note: "Shared catalogue — follow up next week",
      createdById: sales.id,
    },
  });

  console.log("Seed complete");
  console.log("Test credentials:");
  console.log("  admin@test.com / Admin@123");
  console.log("  sales@test.com / Sales@123");
  console.log("  warehouse@test.com / Warehouse@123");
  console.log("  accounts@test.com / Accounts@123");
  console.log(`  Sample customer: ABC Distributors (${customers[0].id})`);
  console.log(`  Sample product: Samsung Monitor stock=${products[0].currentStock}`);
  console.log(`  Admin id: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
