import { z } from "zod";

export const submitFormSchema = z.object({
  answers: z.array(
    z.object({
      fieldId: z.string().uuid("Invalid field ID format"),
      value: z.any(),
    })
  ).min(1, "At least one answer is required"),
});
