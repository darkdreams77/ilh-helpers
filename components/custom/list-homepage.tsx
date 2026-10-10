import Link from "next/link"

import { Button } from "@/components/ui/button"

const features = [
  {
    title: "Rapide",
    text: "Remplir un code n'aura jamais été aussi rapide. En deux-deux, t'as ton code.",
  },
  {
    title: "Simple",
    text: "La simplicité, c'est ce qu'on cherche à tout prix. Tu remplis, copies, colles.",
  },
  {
    title: "Éditable",
    text: "Tu ne perds pas ce que tu as déjà rempli. Tu peux tout éditer en un temps record.",
  },
]

const steps = [
  ["01", "Choisis", "Présentation, fiche de liens… le gabarit qu'il te faut."],
  [
    "02",
    "Remplis",
    "Un formulaire clair. HTML et BBCode acceptés dans les champs.",
  ],
  ["03", "Copie", "Aperçu aux couleurs du forum, puis un clic pour copier."],
]

export function ListHomepage() {
  return (
    <>
      <section className="max-w-8xl mx-auto px-4 py-20 2xl:px-0">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="display text-4xl md:text-6xl">
            Pensé pour <span className="text-crimson">les RPistes.</span>
          </h2>
          <span className="label hidden md:block">Pourquoi</span>
        </div>
        <div className="border-border bg-card grid border md:grid-cols-3">
          {features.map(({ title, text }, index) => (
            <div
              key={title}
              className="border-border flex flex-col gap-4 border-b p-8 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0"
            >
              <span className="label text-crimson">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="display text-3xl">{title}</h3>
              <p className="text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-band text-band-foreground py-20">
        <div className="max-w-8xl mx-auto px-4 2xl:px-0">
          <h2 className="display mb-12 text-4xl md:text-6xl">
            Comment ça <span className="hl">marche.</span>
          </h2>
          <div className="bg-band-foreground/20 grid gap-px md:grid-cols-3">
            {steps.map(([n, title, text]) => (
              <div key={n} className="bg-band space-y-4 p-8">
                <span className="display text-gold block text-7xl">{n}</span>
                <h3 className="display text-2xl">{title}</h3>
                <p className="text-band-foreground/70">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gold text-ink py-24">
        <div className="max-w-8xl mx-auto flex flex-col items-start gap-8 px-4 2xl:px-0">
          <h2 className="display text-5xl text-balance md:text-8xl">
            Ton prochain code,{" "}
            <span className="bg-ink text-gold px-3">c&apos;est ici.</span>
          </h2>
          <Button
            asChild
            size="lg"
            className="bg-ink text-gold hover:bg-ink/85 h-12 px-8 text-base"
          >
            <Link href="/codes">Remplir un code</Link>
          </Button>
        </div>
      </section>
    </>
  )
}
