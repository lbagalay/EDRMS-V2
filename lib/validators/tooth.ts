import { z } from "zod";

export const toothConditionFormSchema = z.object({
  toothNumber: z.coerce.number().int(),
  condition: z.enum([
    "HEALTHY",
    "CARIES",
    "FILLED",
    "MISSING",
    "CROWNED",
    "ROOT_CANAL",
    "EXTRACTED",
    "OTHER",
  ]),
  conditionNote: z.string().optional(),
  dentistNotes: z.string().optional(),
});

export type ToothConditionFormValues = z.infer<typeof toothConditionFormSchema>;

export const toothTreatmentFormSchema = z.object({
  toothNumber: z.coerce.number().int(),
  treatmentId: z.string().min(1, "Select a treatment"),
  status: z.enum(["PLANNED", "COMPLETED"]),
});

export type ToothTreatmentFormValues = z.infer<typeof toothTreatmentFormSchema>;
