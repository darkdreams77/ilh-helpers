import { ArrowRightIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth/helper"
import { templates } from "@/lib/templates"

const ticker = [
  ...templates.map((template) => template.title),
  "Fiche de liens (bientôt)",
  "HTML & BBCode",
  "Aperçu en direct",
  "Copie en un clic",
]

export default async function HeroSection() {
  const user = await auth()

  return (
    <section className="border-border border-b">
      <div className="max-w-8xl mx-auto grid gap-10 px-4 pt-14 pb-16 md:pt-24 lg:grid-cols-[1.3fr_1fr] lg:items-end 2xl:px-0">
        <div className="space-y-8">
          <p className="label text-crimson">I Love Harvard · Aide aux codes</p>
          <h1 className="display text-[clamp(3rem,9vw,7.5rem)] text-balance">
            Tes codes,
            <br />
            <span className="hl">remplis</span> en
            <br />
            deux minutes.
          </h1>
        </div>
        <div className="space-y-6 lg:pb-3">
          <p className="text-muted-foreground max-w-md text-lg">
            La plateforme d&apos;aide aux codes, simples comme compliqués, pour
            I Love Harvard. Par I Love Harvard. Tu remplis, tu copies, tu
            colles.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="group h-12 px-6 text-base">
              <Link href="/codes">
                Remplir un code
                <ArrowRightIcon className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            {!user && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-border h-12 px-6 text-base"
              >
                <Link href="/connexion?type=signup">Créer un compte</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      <div
        className="border-border bg-band text-band-foreground overflow-hidden border-t py-3"
        aria-hidden
      >
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {[...ticker, ...ticker].map((item, index) => (
            <span key={index} className="label flex items-center gap-10">
              {item}
              <span className="text-gold">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
