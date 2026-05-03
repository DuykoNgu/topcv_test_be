import { z } from "zod";

export const submitFormSchema = z.object({
  values: z.array(
    z.object({
      fieldId: z.string().uuid("Định dạng ID trường không hợp lệ"),
      value: z.any(),
    })
  ).min(1, "Yêu cầu ít nhất một giá trị"),
});
