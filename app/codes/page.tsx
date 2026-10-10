import Link from "next/link"

import { PageContainer } from "@/components/custom/page-container"
import { templates } from "@/lib/templates"

export const metadata = { title: "Codes · ILH" }

export default function CodesPage() {
  return (
    <PageContainer>
      <p className="label text-crimson">Gabarits</p>
      <h1 className="display mt-2 text-5xl md:text-7xl">Codes</h1>
      <p className="mt-4 mb-10 max-w-xl text-muted-foreground">
        Choisis un code, remplis le formulaire, copie le résultat.
      </p>
      <div className="grid border border-ink bg-card md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <Link
            key={template.id}
            href={`/codes/${template.id}`}
            className="group flex min-h-56 flex-col justify-between gap-8 p-8 transition-colors hover:bg-ink hover:text-paper"
          >
            <span className="label text-crimson group-hover:text-gold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="space-y-3">
              <h2 className="display text-3xl">{template.title}</h2>
              <p className="text-sm text-muted-foreground group-hover:text-paper/70">
                {template.description}
              </p>
              <span className="label inline-block">Remplir →</span>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}
