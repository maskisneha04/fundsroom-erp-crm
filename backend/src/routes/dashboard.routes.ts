import { Router } from "express";
import { Role } from "@prisma/client";
import { dashboardController } from "../controllers/dashboard.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);
router.get(
  "/summary",
  authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  dashboardController.summary
);

export default router;
