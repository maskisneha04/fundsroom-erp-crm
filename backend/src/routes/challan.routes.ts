import { Router } from "express";
import { Role } from "@prisma/client";
import { challanController } from "../controllers/challan.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createChallanSchema } from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  challanController.list
);
router.get(
  "/:id",
  authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  challanController.getById
);
router.post(
  "/",
  authorize(Role.ADMIN, Role.SALES),
  validateBody(createChallanSchema),
  challanController.create
);
router.post("/:id/confirm", authorize(Role.ADMIN, Role.SALES), challanController.confirm);
router.post("/:id/cancel", authorize(Role.ADMIN, Role.SALES), challanController.cancel);

export default router;
