import { z } from "zod";

export const createFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE"]).optional(),

  order: z.number().int().optional(),
});

export const updateFormSchema = createFormSchema.partial();
