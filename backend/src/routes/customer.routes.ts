import { Router } from "express";
import { Role } from "@prisma/client";
import { customerController } from "../controllers/customer.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { customerSchema, followUpSchema } from "../validators/schemas";

const router = Router();

router.use(authenticate);

router.get("/", authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS), customerController.list);
router.get("/:id", authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS), customerController.getById);
router.post(
  "/",
  authorize(Role.ADMIN, Role.SALES),
  validateBody(customerSchema),
  customerController.create
);
router.put(
  "/:id",
  authorize(Role.ADMIN, Role.SALES),
  validateBody(customerSchema),
  customerController.update
);
router.post(
  "/:id/follow-ups",
  authorize(Role.ADMIN, Role.SALES),
  validateBody(followUpSchema),
  customerController.addFollowUp
);

export default router;
