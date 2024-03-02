"use client"

import Image from "next/image"
import Link from "next/link"

import "@/styles/globals.css"

import { signOut } from "next-auth/react"
import { User } from "@prisma/client"
import { useRouter } from "next/navigation"

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
    "supports-backdrop-blur:bg-white/95 sticky top-0 w-full flex-none bg-white backdrop-blur duration-500 dark:border-slate-50/[0.06] dark:bg-slate-900/50 z-50 border-b border-slate-900/10"

  return (
    <header className={variants}>
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between p-4 2xl:px-0">
          <div className="flex items-center justify-start gap-4">
            <Link href="/">
              <Image
                src="/harvard-logo.png"
                alt="I Love Harvard - Aide aux codes"
                style={{ objectFit: "cover" }}
                className="size-8 lg:size-10"
                width={40}
                height={40}
              />
            </Link>
            <Link href="/">
              <span className="text-lg font-bold">I LOVE HARVARD</span>
            </Link>
          </div>
          <div className="flex gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
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
