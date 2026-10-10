import Link from "next/link"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { templates } from "@/lib/templates"

export const metadata = { title: "Codes · ILH" }

export default function CodesPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Codes</h1>
      <p className="text-muted-foreground mt-1 mb-8">
        Choisis un code, remplis le formulaire, copie le résultat.
      </p>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Link key={template.id} href={`/codes/${template.id}`}>
            <Card className="hover:bg-accent h-full shadow-none transition-colors">
              <CardHeader>
                <CardTitle>{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}
