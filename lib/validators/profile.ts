import { z } from "zod";

export const profileFormSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1, "Last name is required"),
  birthdate: z.string().optional().or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
