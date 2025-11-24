import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-[10px] border border-input bg-background px-3.5 py-3 text-sm shadow-xs transition-all duration-200",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:border-zinc-400",
        "dark:focus-visible:ring-zinc-600/50 dark:focus-visible:border-zinc-500",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "resize-y",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
