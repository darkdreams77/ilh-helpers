import Image from "next/image"
import Link from "next/link"

import "@/styles/globals.css"

import { ToggleDarkMode } from "../toggle-darkmode"

export function Header() {
  const variants =
    "supports-backdrop-blur:bg-white/95 sticky top-0 z-40 w-full flex-none bg-white backdrop-blur duration-500 dark:border-slate-50/[0.06] dark:bg-slate-900/50 z-50 border-b border-slate-900/10"

  return (
    <header className={variants}>
      <div className="max-w-8xl mx-auto">
        <div className="flex items-center justify-between p-4 md:py-4">
          <div className="flex items-center justify-start gap-4">
            <Link href="/">
              <Image
                src="/harvard-logo.png"
                alt="I Love Harvard - Aide aux codes"
                width={40}
                height={40}
              />{" "}
            </Link>
            <Link href="/">
              <span className="text-lg font-bold">I LOVE HARVARD</span>
            </Link>
          </div>
          <ToggleDarkMode />
        </div>
      </div>
    </header>
  )
}
