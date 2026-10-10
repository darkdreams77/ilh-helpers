"use client"

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

/**
 * Bascule clair/sombre. Sans choix préalable, le thème suit celui du système
 * (`defaultTheme="system"`) ; un clic enregistre le thème opposé à celui affiché.
 */
export function ToggleDarkMode() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Basculer entre thème clair et sombre"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="size-5 dark:hidden" />
      <MoonIcon className="hidden size-5 dark:block" />
    </Button>
  )
}
