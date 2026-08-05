import { z } from "zod";
import { PERMANENT_TEETH, PRIMARY_TEETH } from "@/lib/odontogram/tooth-data";

const VALID_TOOTH_NUMBERS = new Set([...PERMANENT_TEETH, ...PRIMARY_TEETH]);

const toothNumberSchema = z.coerce
  .number()
  .int()
  .refine((n) => VALID_TOOTH_NUMBERS.has(n), { message: "Invalid tooth number" });

export const toothConditionFormSchema = z.object({
  toothNumber: toothNumberSchema,
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
  toothNumber: toothNumberSchema,
  treatmentId: z.string().min(1, "Select a treatment"),
  status: z.enum(["PLANNED", "COMPLETED"]),
});

export type ToothTreatmentFormValues = z.infer<typeof toothTreatmentFormSchema>;
