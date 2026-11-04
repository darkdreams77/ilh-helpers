import { redirect } from "next/navigation"

import { CharacterList } from "@/components/custom/character-list"
import { PageContainer } from "@/components/custom/page-container"
import { auth } from "@/lib/auth/helper"
import { listCharacters } from "@/lib/characters/queries"
import { templateTitles } from "@/lib/templates/library"

export const metadata = { title: "Mes codes · ILH" }

export default async function Profile() {
  const user = await auth()

  if (!user) redirect("/")

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

  return (
    <PageContainer>
      <p className="label text-crimson">Profil</p>
      <h1 className="display mt-2 mb-10 text-5xl md:text-7xl">Mes codes</h1>
      <CharacterList characters={characters} />
    </PageContainer>
  )
}
