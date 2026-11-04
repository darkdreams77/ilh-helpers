"use client"

import { useMutation } from "@tanstack/react-query"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, useZodForm } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"

import { AuthField } from "./auth-field"
import { GoogleButton } from "./google-button"
import { signUpAction } from "./signup.action"
import {
  LoginCredentialsFormScheme,
  LoginCredentialsFormType,
} from "./signup.schema"

export function SignUp() {
  const form = useZodForm({
    schema: LoginCredentialsFormScheme,
    defaultValues: { name: "", email: "", password: "", verifyPassword: "" },
  })

  const submitMutation = useMutation({
    mutationFn: async (values: LoginCredentialsFormType) => {
      const { serverError } = await signUpAction(values)

      if (serverError) {
        toast.error(serverError)
        return
      }

      await signIn("credentials", {
        email: values.email,
        password: values.password,
        callbackUrl: `${window.location.origin}/profile`,
      })
    },
  })

  const onSubmit = async (values: LoginCredentialsFormType) => {
    if (values.password !== values.verifyPassword) {
      form.setError("verifyPassword", {
        message: "Les mots de passe ne correspondent pas.",
      })
      return
    }

    return submitMutation.mutateAsync(values)
  }

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-6">
      <AuthField name="name" label="Nom ou pseudo">
        {(field) => <Input {...field} autoComplete="nickname" />}
      </AuthField>
      <AuthField name="email" label="E-mail">
        {(field) => <Input {...field} type="email" autoComplete="email" />}
      </AuthField>
      <AuthField name="password" label="Mot de passe">
        {(field) => <PasswordInput {...field} autoComplete="new-password" />}
      </AuthField>
      <p className="text-muted-foreground -mt-3 text-sm">
        8 caractères minimum, avec au moins une lettre et un chiffre.
      </p>
      <AuthField name="verifyPassword" label="Confirme ton mot de passe">
        {(field) => <PasswordInput {...field} autoComplete="new-password" />}
      </AuthField>
      <Button
        type="submit"
        size="lg"
        className="label h-12 w-full rounded-none"
      >
        Créer mon compte
      </Button>
      <GoogleButton />
    </Form>
  )
}
