import { redirect } from "next/navigation"

import { UsedAvatar } from "@/components/custom/avatar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { auth } from "@/lib/auth/helper"

export default async function Profile() {
  const user = await auth()

  if (!user) redirect("/")

  const { name, email, image, createdAt, updatedAt } = user

  const newDateCreatedAt = new Date(createdAt)
  const newDateUpdatedAt = new Date(updatedAt)

  return (
    <>
      {image && name && <UsedAvatar image={image} name={name} />}
      <div>{name}</div>
      <div>{email}</div>
      <div>Créé le {newDateCreatedAt.toLocaleDateString("fr-FR")}</div>
      <div>Mis à jour le {newDateUpdatedAt.toLocaleDateString("fr-FR")}</div>
    </>
  )
}
