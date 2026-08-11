import { Request, Response, NextFunction } from "express";
import { paramId } from "../utils/params";
import { challanService } from "../services/challan.service";
import { sendPaginated, sendSuccess } from "../utils/response";

export const challanController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await challanService.list(req.query as Record<string, string>);
      return sendPaginated(res, result.items, result.pagination, "Challans fetched successfully");
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await challanService.getById(paramId(req.params.id));
      return sendSuccess(res, data, "Challan fetched successfully");
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await challanService.create(req.user!.id, req.body);
      return sendSuccess(res, data, "Challan created successfully", 201);
    } catch (err) {
      next(err);
    }
  },

  async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await challanService.confirm(paramId(req.params.id), req.user!.id);
      return sendSuccess(res, data, "Challan confirmed successfully");
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await challanService.cancel(paramId(req.params.id));
      return sendSuccess(res, data, "Challan cancelled successfully");
    } catch (err) {
      next(err);
    }
  },
};
