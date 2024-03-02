"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SessionProvider } from "next-auth/react"
import type { PropsWithChildren } from "react"
import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"

const queryClient = new QueryClient()

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
