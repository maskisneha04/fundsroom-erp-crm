import { Request, Response, NextFunction } from "express";
import { paramId } from "../utils/params";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../utils/response";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.login(req.body.email, req.body.password);
      return sendSuccess(res, data, "Login successful");
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await authService.me(req.user!.id);
      return sendSuccess(res, data, "User fetched successfully");
    } catch (err) {
      next(err);
    }
  },
};
