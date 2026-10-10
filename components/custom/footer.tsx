import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

export function Footer() {
  const thisYear = new Date().getFullYear()

  return (
    <footer className="w-full flex-none border-t border-ink bg-ink text-paper">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col items-center justify-between gap-2 px-4 py-6 label md:flex-row 2xl:px-0">
          <span>© {thisYear} ILH · Aide aux codes</span>
          <Link
            href="https://www.i-love-harvard.com"
            target="_blank"
            className="flex items-center gap-1.5 transition-colors hover:text-gold"
          >
            i-love-harvard.com
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  )
}
