import { z } from "zod";

export const appointmentFormSchema = z
  .object({
    date: z.string().trim().min(1, "Date is required"),
    time: z.string().trim().min(1, "Time is required"),
    patientId: z.string().trim().optional().or(z.literal("")),
    walkIn: z.boolean().default(false),
    name: z.string().trim().optional(),
    contactNumber: z
      .string()
      .trim()
      .min(1, "Contact number is required")
      .regex(/^09\d{9}$/, "Use PH mobile format 09XXXXXXXXX"),
    purpose: z.string().trim().min(1, "Purpose is required"),
    status: z.enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]).optional(),
    isPreviousPatient: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.walkIn) {
      if (!data.name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["name"],
          message: "Name is required for walk-in appointments",
        });
      }
    } else if (!data.patientId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["patientId"],
        message: "Please select an existing patient",
      });
    }
  });

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;
