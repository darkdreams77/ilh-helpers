import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

import "@/styles/globals.css"

export function Footer() {
  const thisYear = new Date().getFullYear()

  const variants =
    "supports-backdrop-blur:bg-white/95 w-full flex-none bg-white backdrop-blur duration-500 dark:border-slate-50/[0.06] dark:bg-slate-900/50 border-t border-slate-900/10 mt-12"

  return (
    <footer className={variants}>
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col items-center justify-between gap-2 p-4 md:flex-row md:gap-0 2xl:px-0">
          © ILH · Aide aux codes — {thisYear}
          <Link
            href="https://www.i-love-harvard.com"
            target="_blank"
            className="flex gap-2"
          >
            www.i-love-harvard.com{" "}
            <ArrowTopRightOnSquareIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
