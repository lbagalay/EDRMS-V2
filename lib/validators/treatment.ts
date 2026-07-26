import { z } from "zod";

export const treatmentFormSchema = z.object({
  treatmentName: z.string().min(1, "Treatment name is required"),
  treatmentFee: z.coerce.number().min(0, "Fee must be 0 or greater"),
});

export type TreatmentFormValues = z.infer<typeof treatmentFormSchema>;