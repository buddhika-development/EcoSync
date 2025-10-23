import { z } from "zod";
import { binStatusTypeEnum } from "./bin.schema.js";

export const fetchBinsQuerySchema = z.object({
  // from req.user
  userId: z.string().uuid(),

  // query params
  status: binStatusTypeEnum.optional(),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 1))
    .refine((n) => Number.isInteger(n) && n >= 1, "page must be >= 1"),
  pageSize: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 10))
    .refine((n) => Number.isInteger(n) && n >= 1 && n <= 100, "pageSize must be 1..100"),
});
