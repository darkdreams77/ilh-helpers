"use client"

import Image from "next/image"
import Link from "next/link"

import "@/styles/globals.css"

import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

import { User } from "@/generated/prisma/client"

import { ToggleDarkMode } from "../toggle-darkmode"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { UsedAvatar } from "./avatar"

type HeaderProps = {
  user: User | null
  isAdmin?: boolean
}

export function Header(props: HeaderProps) {
  const router = useRouter()
  const variants =
    "sticky top-0 z-50 w-full flex-none border-b border-border bg-background/95 backdrop-blur-sm"

  return (
    <header className={variants}>
      <div className="max-w-8xl mx-auto">
        <div className="flex h-16 items-center justify-between px-4 2xl:px-0">
          <div className="flex items-center justify-start gap-3">
            <Link href="/">
              <Image
                src="/harvard-logo.png"
                alt="I Love Harvard - Aide aux codes"
                style={{ objectFit: "cover" }}
                className="size-8"
                width={40}
                height={40}
              />
            </Link>
            <Link href="/">
              <span className="display text-lg tracking-tight">
                I Love Harvard
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/codes"
              className="label hover:text-crimson underline-offset-8 transition-colors hover:underline"
            >
              Codes
            </Link>
            {props.user && (
              <Link
                href="/profile"
                className="label hover:text-crimson underline-offset-8 transition-colors hover:underline"
              >
                Mes codes
              </Link>
            )}
            {props.user && (
              <Link
                href="/createur"
                className="label hover:text-crimson underline-offset-8 transition-colors hover:underline"
              >
                Créer
              </Link>
            )}
            <ToggleDarkMode />
            <DropdownMenu>
              <DropdownMenuTrigger className="focus-visible:ring-ring rounded-full focus-visible:ring-2 focus-visible:outline-none">
                <UsedAvatar
                  image={props?.user?.image || "/placeholder.jpg"}
                  name={props?.user?.name || "Invité"}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {props?.user ? (
                  <>
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      Mon profil
                    </DropdownMenuItem>
                    {props.isAdmin && (
                      <DropdownMenuItem
                        onClick={() => router.push("/admin/modeles")}
                      >
                        Valider les modèles
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      Se déconnecter
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    onClick={() => router.push("/connexion?type=login")}
                  >
                    Se connecter
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
