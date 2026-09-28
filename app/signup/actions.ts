"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { parseSignupCredentials } from "@/lib/auth/signup";
import { createClient } from "@/lib/supabase/server";

export type SignupState = {
  error: string | null;
  success: string | null;
};

export async function signup(
  _previousState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  let credentials;

  try {
    credentials = parseSignupCredentials({
      email: formData.get("email"),
      password: formData.get("password"),
      passwordConfirmation: formData.get("passwordConfirmation"),
      acceptTerms: formData.get("acceptTerms"),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: error.issues[0]?.message ?? "Check the information you entered.",
        success: null,
      };
    }

    throw error;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return {
      error: "We couldn't create your account. Please try again.",
      success: null,
    };
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return {
    error: null,
    success: "Check your email to confirm your account, then log in.",
  };
}
