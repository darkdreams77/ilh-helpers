"use client"

import Link from "next/link"
import { useAction } from "next-safe-action/hooks"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  createCharacterAction,
  deleteCharacterAction,
  deleteCodeAction,
} from "@/lib/characters/actions"

export type CharacterItem = {
  id: string
  name: string
  faceclaim: string | null
  codes: { id: string; templateId: string; templateTitle: string; updatedAt: string }[]
}

const onError = ({ error }: { error: { serverError?: string } }) =>
  toast.error(error.serverError ?? "Une erreur est survenue.")

export function CharacterList({ characters }: { characters: CharacterItem[] }) {
  const [name, setName] = useState("")

  const create = useAction(createCharacterAction, {
    onSuccess: () => {
      setName("")
      toast.success("Personnage créé.")
    },
    onError,
  })
  const removeCharacter = useAction(deleteCharacterAction, { onError })
  const removeCode = useAction(deleteCodeAction, { onError })

  return (
    <section className="mt-12">
      <h2 className="display border-b border-border pb-2 text-3xl">
        Mes personnages
      </h2>

      <form
        className="mt-6 flex max-w-md gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          if (name.trim()) create.execute({ name })
        }}
      >
        <Input
          value={name}
          maxLength={80}
          placeholder="Nom du nouveau personnage"
          aria-label="Nom du nouveau personnage"
          onChange={(event) => setName(event.target.value)}
        />
        <Button type="submit" disabled={create.isPending || !name.trim()}>
          Ajouter
        </Button>
      </form>

      {characters.length === 0 ? (
        <p className="text-muted-foreground mt-6">
          Aucun personnage pour l&apos;instant. Enregistre un code depuis un
          gabarit, ou crée-en un ici.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {characters.map((character) => (
            <li key={character.id} className="border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="display text-xl">{character.name}</p>
                  {character.faceclaim && (
                    <p className="label text-muted-foreground">
                      {character.faceclaim}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={removeCharacter.isPending}
                  onClick={() => {
                    if (
                      confirm(
                        `Supprimer ${character.name} et tous ses codes ?`,
                      )
                    ) {
                      removeCharacter.execute({ id: character.id })
                    }
                  }}
                >
                  Supprimer
                </Button>
              </div>

              <ul className="mt-3 flex flex-col gap-2">
                {character.codes.map((code) => (
                  <li
                    key={code.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <Link
                      href={`/codes/${code.templateId}?code=${code.id}`}
                      className="underline"
                    >
                      {code.templateTitle}
                    </Link>
                    <span className="text-muted-foreground">
                      {new Date(code.updatedAt).toLocaleDateString("fr-FR")}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={removeCode.isPending}
                      onClick={() => removeCode.execute({ id: code.id })}
                    >
                      Retirer
                    </Button>
                  </li>
                ))}
              </ul>

              <Link
                href={`/codes?personnage=${character.id}`}
                className="label text-crimson mt-3 inline-block"
              >
                Nouveau code
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
