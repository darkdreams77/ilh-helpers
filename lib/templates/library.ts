import type { CustomTemplate } from "@/generated/prisma/client"
import { isAdmin } from "@/lib/auth/admin"
import prisma from "@/lib/prisma"

import {
  assembleCode,
  CUSTOM_PREFIX,
  parseFields,
  wrapperClass,
} from "./definition"
import { getTemplate, templates } from "./index"
import type { CodeTemplate } from "./types"

type Viewer = { id: string; email?: string | null } | null

type Row = CustomTemplate & { author: { name: string | null } }

/** Modèle exploitable, ou `null` si les champs stockés ne sont pas valides. */
export function rowToTemplate(row: Row): CodeTemplate | null {
  const fields = parseFields(row.fields)
  if (!fields) return null
  return {
    id: `${CUSTOM_PREFIX}${row.id}`,
    title: row.title,
    description: row.description,
    fields,
    html: assembleCode(row.html, row.css, wrapperClass(row.id)),
    kind: row.kind,
    singleLine: true,
    ...(row.author.name ? { author: row.author.name } : {}),
  }
}

/** Modèles intégrés, suivis des modèles de membres publiés. */
export async function listLibrary(): Promise<CodeTemplate[]> {
  const rows = await prisma.customTemplate.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true } } },
  })
  return [...templates, ...rows.flatMap((row) => rowToTemplate(row) ?? [])]
}

/**
 * Modèle intégré, ou modèle de membre : visible s'il est publié, ou par son
 * auteur et les administrateurs (pour le tester avant publication).
 */
export async function findTemplate(
  id: string,
  viewer: Viewer,
): Promise<CodeTemplate | undefined> {
  const builtIn = getTemplate(id)
  if (builtIn || !id.startsWith(CUSTOM_PREFIX)) return builtIn

  const row = await prisma.customTemplate.findUnique({
    where: { id: id.slice(CUSTOM_PREFIX.length) },
    include: { author: { select: { name: true } } },
  })
  if (!row) return undefined

  const allowed =
    row.status === "PUBLISHED" ||
    (viewer !== null && (row.authorId === viewer.id || isAdmin(viewer)))
  return allowed ? (rowToTemplate(row) ?? undefined) : undefined
}

/** Titres des modèles (intégrés ou de membres), pour afficher des codes déjà enregistrés. */
export async function templateTitles(
  ids: string[],
): Promise<Map<string, string>> {
  const titles = new Map<string, string>()
  const customIds: string[] = []
  for (const id of new Set(ids)) {
    const builtIn = getTemplate(id)
    if (builtIn) titles.set(id, builtIn.title)
    else if (id.startsWith(CUSTOM_PREFIX))
      customIds.push(id.slice(CUSTOM_PREFIX.length))
  }
  if (customIds.length > 0) {
    const rows = await prisma.customTemplate.findMany({
      where: { id: { in: customIds } },
      select: { id: true, title: true },
    })
    for (const row of rows) titles.set(`${CUSTOM_PREFIX}${row.id}`, row.title)
  }
  return titles
}
