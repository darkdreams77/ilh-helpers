"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { LogIn } from "@/components/custom/log-in"
import { SignIn } from "@/components/custom/sign-in"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function ConnexionWithParams() {
  const router = useRouter()
  const params = useSearchParams()
  const value = params.get("type") as string

  return (
    <Tabs defaultValue={value} className="mx-auto mt-20 w-[400px]">
      <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur">
        <TabsTrigger
          value="sign-in"
          onClick={() => router.push("/connexion?type=sign-in")}
        >
          Inscription
        </TabsTrigger>
        <TabsTrigger
          value="log-in"
          onClick={() => router.push("/connexion?type=log-in")}
        >
          Connexion
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sign-in">
        <SignIn />
      </TabsContent>
      <TabsContent value="log-in">
        <LogIn />
      </TabsContent>
    </Tabs>
  )
}

export default function Connexion() {
  return (
    <Suspense>
      <ConnexionWithParams />
    </Suspense>
  )
}
