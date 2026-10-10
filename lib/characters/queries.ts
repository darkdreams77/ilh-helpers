import prisma from "@/lib/prisma"

/** Tous les personnages d'un utilisateur, avec leurs codes. */
export function listCharacters(userId: string) {
  return prisma.character.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      codes: {
        select: { id: true, templateId: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  })
}

export function findCharacter(userId: string, id: string) {
  return prisma.character.findFirst({ where: { id, userId } })
}

export function findCode(userId: string, id: string) {
  return prisma.code.findFirst({
    where: { id, character: { userId } },
    include: { character: true },
  })
}
