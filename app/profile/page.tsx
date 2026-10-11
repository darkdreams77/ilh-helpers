import { redirect } from "next/navigation"

import { UsedAvatar } from "@/components/custom/avatar"
import { CharacterList } from "@/components/custom/character-list"
import { PageContainer } from "@/components/custom/page-container"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { auth } from "@/lib/auth/helper"
import { listCharacters } from "@/lib/characters/queries"
import { templateTitles } from "@/lib/templates/library"

export default async function Profile() {
  const user = await auth()

  if (!user) redirect("/")

  const { name, email, image, createdAt, updatedAt } = user

  const rows = await listCharacters(user.id)
  const titles = await templateTitles(
    rows.flatMap((character) => character.codes.map((code) => code.templateId)),
  )
  const characters = rows.map((character) => ({
    id: character.id,
    name: character.name,
    faceclaim: character.faceclaim,
    codes: character.codes.map((code) => ({
      id: code.id,
      templateId: code.templateId,
      templateTitle: titles.get(code.templateId) ?? code.templateId,
      updatedAt: code.updatedAt.toISOString(),
    })),
  }))

  const newDateCreatedAt = new Date(createdAt)
  const newDateUpdatedAt = new Date(updatedAt)

  return (
    <PageContainer>
      {image && name && <UsedAvatar image={image} name={name} />}
      <div>{name}</div>
      <div>{email}</div>
      <div>Créé le {newDateCreatedAt.toLocaleDateString("fr-FR")}</div>
      <div>Mis à jour le {newDateUpdatedAt.toLocaleDateString("fr-FR")}</div>
      <CharacterList characters={characters} />
    </PageContainer>
  )
}
