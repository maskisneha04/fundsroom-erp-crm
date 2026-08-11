import { Router } from "express";
import { Role } from "@prisma/client";
import { productController } from "../controllers/product.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { productSchema, productUpdateSchema, stockInSchema } from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/movements/all",
  authorize(Role.ADMIN, Role.WAREHOUSE, Role.ACCOUNTS, Role.SALES),
  productController.allMovements
);

router.get(
  "/",
  authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  productController.list
);
router.get(
  "/:id",
  authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  productController.getById
);
router.post(
  "/",
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validateBody(productSchema),
  productController.create
);
router.put(
  "/:id",
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validateBody(productUpdateSchema),
  productController.update
);
router.post(
  "/:id/stock-in",
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validateBody(stockInSchema),
  productController.stockIn
);
router.get(
  "/:id/stock-movements",
  authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  productController.stockMovements
);

export default router;
