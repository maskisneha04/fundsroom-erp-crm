import { Request, Response, NextFunction } from "express";
import { paramId } from "../utils/params";
import { productService } from "../services/product.service";
import { sendPaginated, sendSuccess } from "../utils/response";

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.list(req.query as Record<string, string>);
      return sendPaginated(res, result.items, result.pagination, "Products fetched successfully");
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await productService.getById(paramId(req.params.id));
      return sendSuccess(res, data, "Product fetched successfully");
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await productService.create(req.body, req.user!.id);
      return sendSuccess(res, data, "Product created successfully", 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await productService.update(paramId(req.params.id), req.body);
      return sendSuccess(res, data, "Product updated successfully");
    } catch (err) {
      next(err);
    }
  },

  async stockIn(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await productService.stockIn(
        paramId(req.params.id),
        req.user!.id,
        req.body.quantity,
        req.body.reason
      );
      return sendSuccess(res, data, "Stock increased successfully", 201);
    } catch (err) {
      next(err);
    }
  },

  async stockMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.listStockMovements(
        paramId(req.params.id),
        req.query as Record<string, string>
      );
      return sendPaginated(res, result.items, result.pagination, "Stock movements fetched successfully");
    } catch (err) {
      next(err);
    }
  },

  async allMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await productService.listAllMovements(req.query as Record<string, string>);
      return sendPaginated(res, result.items, result.pagination, "Stock movements fetched successfully");
    } catch (err) {
      next(err);
    }
  },
};
