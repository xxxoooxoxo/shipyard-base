"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// Radix Progress has no Track/Label/Value parts (Base UI did). The value is
// shared via context so the hand-ported parts below can keep the old
// composition contract: <Progress> renders children + Track/Indicator itself.
const ProgressContext = React.createContext<{
  value: number | null
  max: number
}>({ value: null, max: 100 })

function Progress({
  className,
  children,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressContext.Provider value={{ value: value ?? null, max }}>
      <ProgressPrimitive.Root
        value={value}
        max={max}
        data-slot="progress"
        className={cn("flex flex-wrap gap-3", className)}
        {...props}
      >
        {children}
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </ProgressPrimitive.Root>
    </ProgressContext.Provider>
  )
}

function ProgressTrack({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  style,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Indicator>) {
  const { value, max } = React.useContext(ProgressContext)
  const percentage = value == null ? 0 : (value / max) * 100
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full w-full bg-primary transition-all", className)}
      style={{ transform: `translateX(-${100 - percentage}%)`, ...style }}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) {
  const { value, max } = React.useContext(ProgressContext)
  return (
    <span
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    >
      {children ??
        (value == null ? null : `${Math.round((value / max) * 100)}%`)}
    </span>
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
}
