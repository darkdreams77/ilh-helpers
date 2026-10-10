"use client"

import type { ReactElement } from "react"
import {
  useFormContext,
  type ControllerRenderProps,
  type FieldValues,
} from "react-hook-form"

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

type AuthFieldProps = {
  name: string
  label: string
  children: (field: ControllerRenderProps<FieldValues, string>) => ReactElement
}

/** Champ d'authentification, au style des champs du générateur. */
export function AuthField({ name, label, children }: AuthFieldProps) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="font-label text-base leading-snug font-semibold tracking-tight">
            {label}
          </FormLabel>
          <FormControl>{children(field)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
