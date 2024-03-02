"use client"

import { signIn } from "next-auth/react"
import { redirect } from "next/navigation"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { auth } from "@/lib/auth/helper"

const LoginCredentialsFormScheme = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
})

type LoginCredentialsFormType = z.infer<typeof LoginCredentialsFormScheme>

export function LogIn() {
  const form = useZodForm({
    schema: LoginCredentialsFormScheme,
  })

  async function onSubmit(values: LoginCredentialsFormType) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    await signIn("credentials", {
      email: values.email,
      password: values.password,
    })
  }

  return (
    <Form
      form={form}
      onSubmit={async (values) => {
        return onSubmit(values)
      }}
    >
      <Card className="bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Tu as déjà un compte ? Renseigne ton e-mail et ton mot de passe.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 space-y-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <PasswordInput {...field} autoComplete="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit">Connexion</Button>
        </CardFooter>
      </Card>
    </Form>
  )
}
