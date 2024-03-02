"use client"

import { useSession } from "next-auth/react"
import { Suspense, useEffect } from "react"
import { redirect, useRouter, useSearchParams } from "next/navigation"

import { LogIn } from "@/app/connexion/login"
import { SignUp } from "@/app/connexion/signup"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

function ConnexionWithParams() {
  const router = useRouter()
  const params = useSearchParams()
  const value = params.get("type") as string
  const { data } = useSession()

  useEffect(() => {
    if (data?.user) redirect("/profile")
  }, [data])

  return (
    <Tabs defaultValue={value} className="mx-auto mt-20 w-[400px]">
      <TabsList className="grid w-full grid-cols-2 bg-slate-500/10 backdrop-blur dark:bg-white/10">
        <TabsTrigger
          value="signup"
          onClick={() => router.push("/connexion?type=signup")}
        >
          Inscription
        </TabsTrigger>
        <TabsTrigger
          value="login"
          onClick={() => router.push("/connexion?type=login")}
        >
          Connexion
        </TabsTrigger>
      </TabsList>
      <TabsContent value="signup">
        <SignUp />
      </TabsContent>
      <TabsContent value="login">
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
