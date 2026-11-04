import { env } from "../env"

const adminEmails = new Set(
  (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
)

/** Administrateur = e-mail listé dans `ADMIN_EMAILS`. */
export function isAdmin(user: { email?: string | null } | null | undefined) {
  return !!user?.email && adminEmails.has(user.email.toLowerCase())
}
