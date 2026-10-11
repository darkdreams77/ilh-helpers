"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { isAdmin } from "@/lib/auth/admin"
import prisma from "@/lib/prisma"
import { ActionError, authAction } from "@/lib/server-actions/safe-actions"

import { templateDraftSchema } from "./definition"

const idSchema = z.object({ id: z.string().min(1).max(100) })

const saveSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  draft: templateDraftSchema,
})

const reviewSchema = z.object({
  id: z.string().min(1).max(100),
  decision: z.enum(["publish", "reject"]),
  note: z.string().trim().max(500).optional(),
})

function refresh() {
  revalidatePath("/createur")
  revalidatePath("/codes")
  revalidatePath("/admin/modeles")
}

/** Modèle appartenant à l'utilisateur et encore modifiable (brouillon ou refusé). */
async function ownEditable(id: string, userId: string) {
  const row = await prisma.customTemplate.findFirst({
    where: { id, authorId: userId },
  })
  if (!row) throw new ActionError("Modèle introuvable.")
  if (row.status === "PENDING" || row.status === "PUBLISHED") {
    throw new ActionError(
      row.status === "PENDING"
        ? "Ce modèle est en cours de validation : il n'est plus modifiable."
        : "Ce modèle est publié : il n'est plus modifiable.",
    )
  }
  return row
}

export const saveTemplateAction = authAction
  .inputSchema(saveSchema)
  .action(async ({ parsedInput: { id, draft }, ctx }) => {
    const data = {
      kind: draft.kind,
      title: draft.title,
      description: draft.description,
      fields: draft.fields,
      html: draft.html,
      css: draft.css,
    }

    if (!id) {
      const count = await prisma.customTemplate.count({
        where: { authorId: ctx.user.id },
      })
      if (count >= 30) {
        throw new ActionError("Tu as atteint la limite de 30 modèles.")
      }
      const row = await prisma.customTemplate.create({
        data: { ...data, authorId: ctx.user.id },
        select: { id: true },
      })
      refresh()
      return { id: row.id }
    }

    await ownEditable(id, ctx.user.id)
    // Un modèle refusé repasse en brouillon dès qu'on le modifie.
    await prisma.customTemplate.update({
      where: { id },
      data: { ...data, status: "DRAFT", reviewNote: null },
    })
    refresh()
    return { id }
  })

export const submitTemplateAction = authAction
  .inputSchema(idSchema)
  .action(async ({ parsedInput, ctx }) => {
    const row = await ownEditable(parsedInput.id, ctx.user.id)
    const check = templateDraftSchema.safeParse({
      kind: row.kind,
      title: row.title,
      description: row.description,
      fields: row.fields,
      html: row.html,
      css: row.css,
    })
    if (!check.success) {
      throw new ActionError(
        check.error.issues[0]?.message ?? "Ce modèle n'est pas valide.",
      )
    }
    await prisma.customTemplate.update({
      where: { id: row.id },
      data: { status: "PENDING", reviewNote: null },
    })
    refresh()
  })

export const deleteTemplateAction = authAction
  .inputSchema(idSchema)
  .action(async ({ parsedInput, ctx }) => {
    const row = await prisma.customTemplate.findFirst({
      where: { id: parsedInput.id, authorId: ctx.user.id },
    })
    if (!row) throw new ActionError("Modèle introuvable.")
    if (row.status === "PUBLISHED") {
      throw new ActionError(
        "Un modèle publié ne peut pas être supprimé : des codes l'utilisent peut-être.",
      )
    }
    await prisma.customTemplate.delete({ where: { id: row.id } })
    refresh()
  })

export const reviewTemplateAction = authAction
  .inputSchema(reviewSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!isAdmin(ctx.user)) throw new ActionError("Accès refusé.")

    const row = await prisma.customTemplate.findUnique({
      where: { id: parsedInput.id },
    })
    if (!row || row.status !== "PENDING") {
      throw new ActionError("Ce modèle n'est plus en attente de validation.")
    }

    await prisma.customTemplate.update({
      where: { id: row.id },
      data:
        parsedInput.decision === "publish"
          ? { status: "PUBLISHED", reviewNote: null }
          : { status: "REJECTED", reviewNote: parsedInput.note || null },
    })
    refresh()
  })
