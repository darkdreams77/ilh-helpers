/**
 * v0 by Vercel.
 * @see https://v0.dev/t/IbXIvJLKeLs
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
              The Web. Now. Everywhere.
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
              La plateforme d'aide aux codes{" "}
              <em>(simples, comme compliqués)</em>, pour I Love Harvard. Par I
              Love Harvard.
            </p>
          </div>
          <div className="flex w-full max-w-sm flex-col space-y-2">
            <Button type="button" asChild className="text-md font-bold">
              <Link href="/connexion?type=sign-in">Inscris-toi</Link>
            </Button>{" "}
            <span className="text-xs">
              ou{" "}
              <Link href="/connexion?type=log-in" className="underline">
                connecte-toi
              </Link>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
