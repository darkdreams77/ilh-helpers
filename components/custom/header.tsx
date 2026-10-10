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
}

export function Header(props: HeaderProps) {
  const router = useRouter()
  const variants =
    "sticky top-0 z-50 w-full flex-none border-b border-ink bg-background/95 backdrop-blur-sm"

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
              <span className="display text-lg tracking-tight">I Love Harvard</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/codes"
              className="label underline-offset-8 transition-colors hover:text-crimson hover:underline"
            >
              Codes
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <UsedAvatar
                  image={props?.user?.image || "/placeholder.jpg"}
                  name={props?.user?.name || "Invité"}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <ToggleDarkMode />

                {props?.user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      Se déconnecter
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
