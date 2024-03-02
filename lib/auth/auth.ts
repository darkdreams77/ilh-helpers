import { PrismaAdapter } from "@auth/prisma-adapter"
import type { User } from "@prisma/client"
import NextAuth, { type Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import { env } from "../env"
import prisma from "../prisma"
import {
  credentialsOverrideJwt,
  getCredentialsProvider,
} from "./credentials-provider"

export const { handlers, auth: baseAuth } = NextAuth((req) => ({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    // 🔑 Add this line and the import to add credentials provider
    getCredentialsProvider(),
  ],
  session: {
    strategy: "database",
  },
  secret: env.NEXTAUTH_SECRET,
  callbacks: {
    session(params) {
      if (params.newSession) return params.session

      const typedParams = params as unknown as {
        session: Session
        user?: User
      }

      if (!typedParams.user) return typedParams.session

      typedParams.user.passwordHash = null

      return typedParams.session
    },
  },
  // 🔑 Add this line and the import to add credentials provider
  jwt: credentialsOverrideJwt,
}))
