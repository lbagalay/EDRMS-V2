"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function SignUpForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      username: String(form.get("username")),
      password: String(form.get("password")),
      firstName: String(form.get("firstName")),
      lastName: String(form.get("lastName")),
    };

    const result = await signUp(payload);
    setPending(false);

    if (result?.error) {
      toast.error(
        typeof result.error === "string" ? result.error : "Please check the form for errors"
      );
    } else {
      toast.success("Account created! Please log in.");
      router.push("/login");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input name="firstName" required />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input name="lastName" required />
        </div>
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input name="username" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input name="password" type="password" required />
        <p className="mt-1 text-xs text-slate-500">
          At least 8 characters, with an uppercase letter, a number, and a special character.
        </p>
      </div>
      <Button type="submit" disabled={pending} className="w-full bg-[#189AB4] hover:bg-[#147c92]">
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}