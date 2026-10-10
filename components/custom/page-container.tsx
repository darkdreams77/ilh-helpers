import { cn } from "@/lib/utils"

export function PageContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("max-w-8xl mx-auto w-full px-4 py-10 2xl:px-0", className)}
      {...props}
    />
  )
}
