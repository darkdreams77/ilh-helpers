"use server"

import {
  hashStringWithSalt,
  validatePassword,
} from "@/lib/auth/credentials-provider"
import { env } from "@/lib/env"
import prisma from "@/lib/prisma"
import { action, ActionError } from "@/lib/server-actions/safe-actions"

import { LoginCredentialsFormScheme } from "./signup.schema"

export const signUpAction = action(
  LoginCredentialsFormScheme,
  async ({ email, password, name }) => {
    if (!validatePassword(password)) {
      throw new ActionError(
        "Invalid new password. Must be at least 8 characters, and contain at least one letter and one number",
      )
    }

    try {
      const userData = {
        email,
        passwordHash: hashStringWithSalt(password, env.NEXTAUTH_SECRET),
        name,
      }

      const user = await prisma.user.create({
        data: {
          ...userData,
        },
      })

      return user
    } catch {
      throw new ActionError("Email already exists")
    }
  },
)
