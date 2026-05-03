import { z } from "zod";

export const createFormSchema = z.object({
  title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự"),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE"]).optional(),

  order: z.number().int().optional(),
  fields: z.any().optional(),
});

export const updateFormSchema = createFormSchema.partial();
