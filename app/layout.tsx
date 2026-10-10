import type { Metadata } from "next"
import { Archivo, Inter, JetBrains_Mono } from "next/font/google"

import "@/styles/globals.css"

import { Footer } from "@/components/custom/footer"
import { Header } from "@/components/custom/header"
import { auth } from "@/lib/auth/helper"
import { cn } from "@/lib/utils"

import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["700", "800", "900"],
})
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-label",
})

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
    <html
      lang="fr"
      className={cn("h-full", inter.variable, archivo.variable, mono.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <Providers>
          <Header user={user} />
          <main className="w-full flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
