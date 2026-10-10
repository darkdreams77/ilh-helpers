import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function HeroSection() {
  return (
    <section className="w-full py-16 md:py-24 lg:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-4 text-center">
        <div className="space-y-4">
          <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Tes codes, remplis en deux minutes.
          </h1>
          <p className="text-lg text-muted-foreground">
            La plateforme d&apos;aide aux codes, simples comme compliqués, pour
            I Love Harvard. Par I Love Harvard.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/codes">Remplir un code</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link href="/connexion?type=signup">Créer un compte</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
