import crypto from "crypto"
import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"
import type { NextAuthConfig } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

import { env } from "../env"
import prisma from "../prisma"

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export const validatePassword = (password: string) => {
  return PASSWORD_REGEX.test(password)
}

const BCRYPT_ROUNDS = 12

const isLegacyHash = (hash: string) => /^[0-9a-f]{64}$/.test(hash)

/**
 * Legacy scheme (SHA-256 salted with NEXTAUTH_SECRET). Only kept to verify
 * and transparently upgrade hashes created before the bcrypt migration.
 */
const legacyHash = (password: string) =>
  crypto
    .createHash("sha256")
    .update(env.NEXTAUTH_SECRET + password)
    .digest("hex")

export const hashPassword = (password: string) =>
  bcrypt.hash(password, BCRYPT_ROUNDS)

const verifyPassword = async (password: string, hash: string) => {
  if (isLegacyHash(hash)) {
    const expected = Buffer.from(legacyHash(password))
    const actual = Buffer.from(hash)
    return (
      expected.length === actual.length &&
      crypto.timingSafeEqual(expected, actual)
    )
  }

  return bcrypt.compare(password, hash)
}

// Used to keep response time constant when the user does not exist.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", BCRYPT_ROUNDS)

export const getCredentialsProvider = () => {
  return CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "E-mail", type: "email" },
      password: { label: "Mot de passe", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials.email || !credentials.password) return null

      const email = String(credentials.email).trim().toLowerCase()
      const password = String(credentials.password)

      const user = await prisma.user.findUnique({ where: { email } })

      if (!user?.passwordHash) {
        await bcrypt.compare(password, DUMMY_HASH)
        return null
      }

      if (!(await verifyPassword(password, user.passwordHash))) return null

      if (isLegacyHash(user.passwordHash)) {
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: await hashPassword(password) },
        })
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      }
    },
  })
}

const tokenName =
  env.NODE_ENV === "development"
    ? "authjs.session-token"
    : "__Secure-authjs.session-token"

type SignInCallback = NonNullable<NextAuthConfig["events"]>["signIn"]

type JwtOverride = NonNullable<NextAuthConfig["jwt"]>

export const credentialsSignInCallback =
  (request: NextRequest | undefined): SignInCallback =>
  async ({ user }) => {
    if (!request) {
      return
    }

    if (request.method !== "POST") {
      return
    }

    const currentUrl = request.url

    if (!currentUrl.includes("credentials")) {
      return
    }

    if (!currentUrl.includes("callback")) {
      return
    }

    const uuid = nanoid()
    // + 7 days
    const expireAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.session.create({
      data: {
        sessionToken: uuid,
        userId: user.id ?? "",
        // expires in 2 weeks
        expires: expireAt,
      },
    })

    const cookieList = cookies()

    cookieList.set(tokenName, uuid, {
      expires: expireAt,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    })

    return
  }

// This override cancel JWT strategy for password. (it's the default one)
export const credentialsOverrideJwt: JwtOverride = {
  encode() {
    return ""
  },
  async decode() {
    return null
  },
}
