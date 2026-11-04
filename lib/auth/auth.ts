import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { type Session } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

import type { User } from "@/generated/prisma/client"

import { env } from "../env"
import prisma from "../prisma"
import {
  credentialsOverrideJwt,
  credentialsSignInCallback,
  getCredentialsProvider,
} from "./credentials-provider"

export const { handlers, auth: baseAuth } = NextAuth((req) => ({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
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

      const { session, user } = params as unknown as {
        session: Session
        user?: User
      }

      if (!user) return session

      // Only expose what the app needs: never the DB session token nor the
      // password hash (this object is served by /api/auth/session).
      return {
        expires: session.expires,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      } as unknown as Session
    },
  },
  // Credentials provider can't create database sessions on its own:
  // the signIn event creates the session row and cookie.
  events: {
    signIn: credentialsSignInCallback(req),
  },
  jwt: credentialsOverrideJwt,
}))
