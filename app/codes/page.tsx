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
      <h1 className="mb-6 text-3xl font-bold">Codes</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Link key={template.id} href={`/codes/${template.id}`}>
            <Card className="h-full transition hover:border-primary">
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
