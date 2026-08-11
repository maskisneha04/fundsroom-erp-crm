import { Response } from "express";

export function sendSuccess(
  res: Response,
  data: unknown,
  message = "Success",
  statusCode = 200
) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendPaginated(
  res: Response,
  data: unknown,
  pagination: { page: number; limit: number; total: number; totalPages: number },
  message = "Success"
) {
  return res.status(200).json({ success: true, message, data, pagination });
}
