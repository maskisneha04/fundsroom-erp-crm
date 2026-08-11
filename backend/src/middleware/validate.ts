import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors";

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new ValidationError(
          "Validation failed",
          result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message }))
        )
      );
    }
    req.body = result.data;
    next();
  };
}
