import { redirect } from "next/navigation"

import { PageContainer } from "@/components/custom/page-container"
import { UsedAvatar } from "@/components/custom/avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CharacterList } from "@/components/custom/character-list"
import { auth } from "@/lib/auth/helper"
import { listCharacters } from "@/lib/characters/queries"
import { getTemplate } from "@/lib/templates"

export default async function Profile() {
  const user = await auth()

  if (!user) redirect("/")

  const { name, email, image, createdAt, updatedAt } = user

  const characters = (await listCharacters(user.id)).map((character) => ({
    id: character.id,
    name: character.name,
    faceclaim: character.faceclaim,
    codes: character.codes.map((code) => ({
      id: code.id,
      templateId: code.templateId,
      templateTitle: getTemplate(code.templateId)?.title ?? code.templateId,
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
