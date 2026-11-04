"use server"

import { Prisma } from "@/generated/prisma/client"
import { hashPassword, validatePassword } from "@/lib/auth/credentials-provider"
import prisma from "@/lib/prisma"
import { action, ActionError } from "@/lib/server-actions/safe-actions"

import { LoginCredentialsFormScheme } from "./signup.schema"

export const signUpAction = action
  .inputSchema(LoginCredentialsFormScheme)
  .action(async ({ parsedInput: { email, password, name } }) => {
    if (!validatePassword(password)) {
      throw new ActionError(
        "Invalid new password. Must be at least 8 characters, and contain at least one letter and one number",
      )
    }

    try {
      const user = await prisma.user.create({
        data: {
          email: email.trim().toLowerCase(),
          passwordHash: await hashPassword(password),
          name,
        },
        select: { id: true },
      })

      return user
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        throw new ActionError("Email already exists")
      }
      throw e
    }
  })
