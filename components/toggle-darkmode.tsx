"use client"

import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"

import {
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

export function ToggleDarkMode() {
  const { setTheme, theme } = useTheme()

  return (
    <>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>Choix du thème</DropdownMenuSubTrigger>
        <DropdownMenuPortal>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="dark">
                <MoonIcon className="mr-2" /> Thème foncé
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="light">
                <SunIcon className="mr-2" /> Thème clair
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuPortal>
      </DropdownMenuSub>
    </>
  )
}
