"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileFormSchema } from "@/lib/validators/profile";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const values = Object.fromEntries(formData.entries());
  const parsed = profileFormSchema.safeParse({
    firstName: values.firstName,
    middleName: values.middleName,
    lastName: values.lastName,
    birthdate: values.birthdate,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid form values");
  }

  const data = parsed.data;

  await prisma.account.update({
    where: { accountId: Number(session.user.id) },
    data: {
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      birthdate: data.birthdate ? new Date(data.birthdate) : null,
    },
  });

  revalidatePath("/profile");
  redirect("/profile");
}
