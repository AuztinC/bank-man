"use server";
import { redirect } from "next/navigation";
import { parseLoginCredentials } from "@/lib/auth/login";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  console.log(formData)
  const credentials = parseLoginCredentials({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember")
  });
  console.log("user sign-in attempt, ", credentials);

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return { error: "The email or password you entered is incorrect." };
  }
  
  redirect("/dashboard");
}
