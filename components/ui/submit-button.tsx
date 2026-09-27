"use client"

import * as React from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  pendingText?: React.ReactNode
  showSpinner?: boolean
}

export function SubmitButton({
  children,
  pendingText,
  showSpinner = true,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={cn("relative transition-all duration-200", className)}
      {...props}
    >
      {pending ? (
        <span className="flex items-center gap-1.5 animate-pulse">
          {showSpinner && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
          <span>{pendingText || children}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  )
}
