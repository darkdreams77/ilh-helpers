import { useMutation } from "@tanstack/react-query"
import { signIn } from "next-auth/react"
import { toast } from "sonner"

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
import { Separator } from "@/components/ui/separator"

import { signUpAction } from "./signup.action"
import {
  LoginCredentialsFormScheme,
  LoginCredentialsFormType,
} from "./signup.schema"

export function SignUp() {
  const form = useZodForm({
    schema: LoginCredentialsFormScheme,
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

        callbackUrl: `${window.location.origin}/`,
      })
    },
  })

  const onSubmit = async (values: LoginCredentialsFormType) => {
    if (values.password !== values.verifyPassword) {
      form.setError("verifyPassword", {
        message: "Password does not match",
      })
      return
    }

    console.log("ok")

    return submitMutation.mutateAsync(values)
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
          <CardTitle>Inscription</CardTitle>
          <CardDescription>
            Tu souhaites t'inscrire ? Tu es au bon endroit !
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
                <FormLabel>Choisis un mot de passe</FormLabel>
                <FormControl>
                  <PasswordInput {...field} autoComplete="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="verifyPassword"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>Confirme ton mot de passe</FormLabel>
                <FormControl>
                  <PasswordInput {...field} autoComplete="none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit">Inscription</Button>
        </CardFooter>
        <Separator />
        <CardContent>
          <Button type="button" onClick={() => signIn("google")}>
            Sign-in avec Google
          </Button>
        </CardContent>
      </Card>
    </Form>
  )
}
