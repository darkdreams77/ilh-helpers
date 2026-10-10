"use client"

import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"

export function GoogleButton() {
  return (
    <>
      <div className="label text-muted-foreground flex items-center gap-4">
        <span className="bg-border h-px flex-1" />
        ou
        <span className="bg-border h-px flex-1" />
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="label h-12 w-full rounded-none"
        onClick={() => signIn("google", { callbackUrl: "/profile" })}
      >
        Continuer avec Google
      </Button>
    </>
  )
}
