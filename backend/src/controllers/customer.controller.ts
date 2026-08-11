import { Request, Response, NextFunction } from "express";
import { paramId } from "../utils/params";
import { customerService } from "../services/customer.service";
import { sendPaginated, sendSuccess } from "../utils/response";

export const customerController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await customerService.list(req.query as Record<string, string>);
      return sendPaginated(res, result.items, result.pagination, "Customers fetched successfully");
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.getById(paramId(req.params.id));
      return sendSuccess(res, data, "Customer fetched successfully");
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.create(req.body);
      return sendSuccess(res, data, "Customer created successfully", 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.update(paramId(req.params.id), req.body);
      return sendSuccess(res, data, "Customer updated successfully");
    } catch (err) {
      next(err);
    }
  },

  async addFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await customerService.addFollowUp(paramId(req.params.id), req.user!.id, req.body);
      return sendSuccess(res, data, "Follow-up added successfully", 201);
    } catch (err) {
      next(err);
    }
  },
};
