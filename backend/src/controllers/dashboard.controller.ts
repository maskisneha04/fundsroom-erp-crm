import { Request, Response, NextFunction } from "express";
import { paramId } from "../utils/params";
import { dashboardService } from "../services/dashboard.service";
import { sendSuccess } from "../utils/response";

export const dashboardController = {
  async summary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.summary();
      return sendSuccess(res, data, "Dashboard summary fetched successfully");
    } catch (err) {
      next(err);
    }
  },
};
