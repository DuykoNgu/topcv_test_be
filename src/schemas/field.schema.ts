import { z } from "zod";

export const createFieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(["TEXT", "NUMBER", "DATE", "COLOR", "SELECT"]),

  required: z.boolean().optional(),
  options: z.array(z.string()).optional(),
  order: z.number().int().optional(),
});

export const updateFieldSchema = createFieldSchema.partial();
