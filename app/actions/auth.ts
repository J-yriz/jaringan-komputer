"use server"

import { CredentialsSignin } from "next-auth"
import { signIn } from "@/auth"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    // AuthJS throws CredentialsSignin when credentials are invalid
    if (error instanceof CredentialsSignin) {
      return { error: "Email atau password salah" }
    }
    // Other errors (e.g. redirect) are re-thrown
    throw error
  }

  redirect("/dashboard")
}