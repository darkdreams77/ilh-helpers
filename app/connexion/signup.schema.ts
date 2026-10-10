import { z } from "zod"

export const LoginCredentialsFormScheme = z.object({
  name: z.string().trim().min(2, "Choisis un nom d'au moins 2 caractères."),
  email: z.string().email("Renseigne une adresse e-mail valide."),
  password: z.string().min(8, "8 caractères minimum."),
  verifyPassword: z.string().min(8, "8 caractères minimum."),
})

export type LoginCredentialsFormType = z.infer<
  typeof LoginCredentialsFormScheme
>
