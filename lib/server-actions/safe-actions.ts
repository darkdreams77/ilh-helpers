import { createSafeActionClient } from "next-safe-action"

import type { User } from "@/generated/prisma/client"

import { auth } from "../auth/helper"

export class ActionError extends Error {
  constructor(message: string) {
    super(message)
  }
}

const handleServerError = (e: Error) => {
  if (e instanceof ActionError) {
    return e.message
  }

  return "An unexpected error occurred."
}

export const action = createSafeActionClient({
  handleServerError,
})

const getUser = async () => {
  const user = await auth()

  if (!user) {
    throw new ActionError("Session not found!")
  }

  if (!user.id || !user.email) {
    throw new ActionError("Session is not valid!")
  }

  return user as User
}

export const authAction = action.use(async ({ next }) => {
  const user = await getUser()

  return next({ ctx: { user } })
})
