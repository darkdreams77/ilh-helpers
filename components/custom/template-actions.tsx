"use client"

import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  deleteTemplateAction,
  reviewTemplateAction,
} from "@/lib/templates/custom-actions"

const onError = ({ error }: { error: { serverError?: string } }) =>
  toast.error(error.serverError ?? "Une erreur est survenue.")

export function DeleteTemplateButton({
  id,
  title,
}: {
  id: string
  title: string
}) {
  const router = useRouter()
  const remove = useAction(deleteTemplateAction, {
    onSuccess: () => {
      toast.success("Modèle supprimé.")
      router.refresh()
    },
    onError,
  })

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={remove.isPending}
      onClick={() => {
        if (confirm(`Supprimer « ${title} » ?`)) remove.execute({ id })
      }}
    >
      Supprimer
    </Button>
  )
}

export function ReviewControls({ id }: { id: string }) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const review = useAction(reviewTemplateAction, {
    onSuccess: ({ input }) => {
      toast.success(
        input.decision === "publish" ? "Modèle publié." : "Modèle refusé.",
      )
      router.refresh()
    },
    onError,
  })

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Button
        type="button"
        disabled={review.isPending}
        onClick={() => review.execute({ id, decision: "publish" })}
      >
        Publier
      </Button>
      <Input
        className="max-w-xs"
        value={note}
        maxLength={500}
        placeholder="Motif du refus (visible par l'auteur)"
        aria-label="Motif du refus"
        onChange={(event) => setNote(event.target.value)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={review.isPending}
        onClick={() => review.execute({ id, decision: "reject", note })}
      >
        Refuser
      </Button>
    </div>
  )
}
