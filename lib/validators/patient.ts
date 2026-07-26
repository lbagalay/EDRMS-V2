import { z } from "zod";

export const patientFormSchema = z.object({
  lastName: z.string().trim().min(1, "Last name is required"),
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional(),
  birthdate: z.string().optional().or(z.literal("")),
  sex: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional(),
  contactNumber: z.string().trim().min(1, "Contact number is required"),
  address: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  medicalAlerts: z.string().trim().optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;
