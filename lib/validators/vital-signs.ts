import { z } from "zod";

export const vitalSignsFormSchema = z.object({
  temperature: z.coerce.number().min(30).max(45),
  pulseRate: z.coerce.number().int().min(0),
  systolicBp: z.coerce.number().int().min(0),
  diastolicBp: z.coerce.number().int().min(0),
  timeTaken: z.string().min(1, "Time is required"),
});

export type VitalSignsFormValues = z.infer<typeof vitalSignsFormSchema>;