import type { Metadata } from "next"
import { Work_Sans } from "next/font/google"

import "@/styles/globals.css"

import { Footer } from "@/components/custom/footer"
import { Header } from "@/components/custom/header"
import { auth } from "@/lib/auth/helper"
import { cn } from "@/lib/utils"

import { Providers } from "./providers"

const WorkSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans" })

export const metadata: Metadata = {
  title: "ILH · Aide aux codes",
  description:
    "Remplis tes codes de forum (présentation, fiche de liens…) depuis un formulaire, puis copie-les.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await auth()

  return (
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          "flex min-h-screen flex-col justify-between bg-background font-sans text-foreground antialiased",
          WorkSans.variable,
        )}
      >
        <Providers>
          <Header user={user} />
          <div className="max-w-8xl mx-auto mt-8 w-full flex-grow px-4 2xl:px-0">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
