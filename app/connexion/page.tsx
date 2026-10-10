"use client"

import { useSession } from "next-auth/react"
import { Suspense, useEffect } from "react"
import { redirect, useRouter, useSearchParams } from "next/navigation"

import { LogIn } from "@/app/connexion/login"
import { SignUp } from "@/app/connexion/signup"
import { PageContainer } from "@/components/custom/page-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const tabClass =
  "label data-[state=active]:bg-gold data-[state=active]:text-[hsl(244_93%_18%)] h-full rounded-none py-3 shadow-none data-[state=active]:shadow-none"

function ConnexionWithParams() {
  const router = useRouter()
  const params = useSearchParams()
  const value = params.get("type") === "signup" ? "signup" : "login"
  const { data } = useSession()

  useEffect(() => {
    if (data?.user) redirect("/profile")
  }, [data])

  return (
    <div className="border-border bg-card grid border md:grid-cols-[1fr_1.1fr]">
      <aside className="bg-band text-band-foreground flex flex-col justify-between gap-12 p-8 md:p-12">
        <p className="label text-gold">I Love Harvard</p>
        <div className="space-y-4">
          <h1 className="display text-5xl md:text-7xl">
            {value === "signup" ? (
              <>
                Rejoins <span className="hl">le campus</span>
              </>
            ) : (
              <>
                Content de <span className="hl">te revoir</span>
              </>
            )}
          </h1>
          <p className="text-band-foreground/70 max-w-sm text-sm">
            Un compte te permet de garder tes personnages et d&apos;enregistrer
            tes codes pour les retrouver à tout moment.
          </p>
        </div>
      </aside>
      <Tabs
        value={value}
        onValueChange={(next) => router.replace(`/connexion?type=${next}`)}
        className="p-6 md:p-12"
      >
        <TabsList className="mb-8 grid h-auto w-full grid-cols-2 rounded-none p-0">
          <TabsTrigger value="login" className={tabClass}>
            Connexion
          </TabsTrigger>
          <TabsTrigger value="signup" className={tabClass}>
            Inscription
          </TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LogIn />
        </TabsContent>
        <TabsContent value="signup">
          <SignUp />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function Connexion() {
  return (
    <PageContainer>
      <Suspense>
        <ConnexionWithParams />
      </Suspense>
    </PageContainer>
  )
}
