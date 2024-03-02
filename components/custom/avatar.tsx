import { twMerge } from "tailwind-merge"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type AvatarProps = {
  image: string
  name: string
  customClasses?: string
}

export function UsedAvatar({ image, name, customClasses }: AvatarProps) {
  var matches = name.match(/\b(\w)/g)
  var acronym = matches!.join("")

  const variants = "border-solid border-2 border-slate-400 dark:border-white"

  return (
    <Avatar className={twMerge(variants, customClasses)}>
      <AvatarImage src={image} alt={name} />
      <AvatarFallback>{acronym}</AvatarFallback>
    </Avatar>
  )
}
