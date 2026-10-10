"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, useZodForm } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

import { AuthField } from "./auth-field"
import { GoogleButton } from "./google-button"

const LoginFormScheme = z.object({
  email: z.string().email("Renseigne une adresse e-mail valide."),
  password: z.string().min(1, "Renseigne ton mot de passe."),
})

type LoginFormType = z.infer<typeof LoginFormScheme>

export function LogIn() {
  const router = useRouter()
  const form = useZodForm({
    schema: LoginFormScheme,
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginFormType) {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })

    if (!result || result.error) {
      toast.error("E-mail ou mot de passe incorrect.")
      return
    }

    router.push("/profile")
    router.refresh()
  }

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6">
      <AuthField name="email" label="E-mail">
        {(field) => <Input {...field} type="email" autoComplete="email" />}
      </AuthField>
      <AuthField name="password" label="Mot de passe">
        {(field) => (
          <PasswordInput {...field} autoComplete="current-password" />
        )}
      </AuthField>
      <Button
        type="submit"
        size="lg"
        className="label h-12 w-full rounded-none"
      >
        Me connecter
      </Button>
      <GoogleButton />
    </Form>
  )
}
