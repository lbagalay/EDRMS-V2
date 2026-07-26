import { z } from "zod";

export const visitFormSchema = z.object({
  visitPurpose: z.string().min(1, "Visit purpose is required"),
  dateVisit: z.string().min(1, "Date is required"),
  treatmentIds: z.array(z.string()).min(1, "Select at least one treatment"),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  additionalFees: z.coerce.number().min(0).default(0),
  amountPaid: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
});

export type VisitFormValues = z.infer<typeof visitFormSchema>;