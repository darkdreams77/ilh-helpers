"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/lib/prisma"
import { ActionError, authAction } from "@/lib/server-actions/safe-actions"
import { getTemplate } from "@/lib/templates"

import {
  createCharacterSchema,
  idSchema,
  sanitizeValues,
  saveCodeSchema,
} from "./schema"

const clean = (value: string | undefined) => value?.trim() || null

export const saveCodeAction = authAction
  .inputSchema(saveCodeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const template = getTemplate(parsedInput.templateId)
    if (!template) throw new ActionError("Modèle inconnu.")

    const values = sanitizeValues(template, parsedInput.values)

    let character = parsedInput.characterId
      ? await prisma.character.findFirst({
          where: { id: parsedInput.characterId, userId: ctx.user.id },
        })
      : null

    if (parsedInput.characterId && !character) {
      throw new ActionError("Personnage introuvable.")
    }

    if (!character) {
      character = await prisma.character.create({
        data: {
          userId: ctx.user.id,
          name: parsedInput.newCharacterName!,
          avatar: clean(values.avatar),
          faceclaim: clean(values.faceclaim),
        },
      })
    } else if (!character.avatar || !character.faceclaim) {
      character = await prisma.character.update({
        where: { id: character.id },
        data: {
          avatar: character.avatar ?? clean(values.avatar),
          faceclaim: character.faceclaim ?? clean(values.faceclaim),
        },
      })
    }

    const code = await prisma.code.upsert({
      where: {
        characterId_templateId: {
          characterId: character.id,
          templateId: template.id,
        },
      },
      create: { characterId: character.id, templateId: template.id, values },
      update: { values },
    })

    revalidatePath("/profile")
    return { codeId: code.id, characterId: character.id }
  })

export const createCharacterAction = authAction
  .inputSchema(createCharacterSchema)
  .action(async ({ parsedInput, ctx }) => {
    const character = await prisma.character.create({
      data: { userId: ctx.user.id, name: parsedInput.name },
    })
    revalidatePath("/profile")
    return { characterId: character.id }
  })

export const deleteCharacterAction = authAction
  .inputSchema(idSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { count } = await prisma.character.deleteMany({
      where: { id: parsedInput.id, userId: ctx.user.id },
    })
    if (count === 0) throw new ActionError("Personnage introuvable.")
    revalidatePath("/profile")
  })

export const deleteCodeAction = authAction
  .inputSchema(idSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { count } = await prisma.code.deleteMany({
      where: { id: parsedInput.id, character: { userId: ctx.user.id } },
    })
    if (count === 0) throw new ActionError("Code introuvable.")
    revalidatePath("/profile")
  })
