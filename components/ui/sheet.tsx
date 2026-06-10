"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { renderAsChild, type RenderProp } from "@/lib/render"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

// Base UI compat: see the matching shim in dialog.tsx.
const SheetDismissibleContext = React.createContext(true)

function Sheet({
  dismissible = true,
  ...props
}: Omit<React.ComponentProps<typeof SheetPrimitive.Root>, "onOpenChange"> & {
  /** Base UI compat: when false, interacting outside does not close the sheet. */
  dismissible?: boolean
  onOpenChange?: (
    open: boolean,
    eventDetails?: { reason?: string; event?: Event }
  ) => void
}) {
  return (
    <SheetDismissibleContext.Provider value={dismissible}>
      <SheetPrimitive.Root data-slot="sheet" {...props} />
    </SheetDismissibleContext.Provider>
  )
}

function SheetTrigger({
  render,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger> & {
  render?: RenderProp
}) {
  return (
    <SheetPrimitive.Trigger
      data-slot="sheet-trigger"
      {...props}
      {...renderAsChild(render, children)}
    />
  )
}

function SheetClose({
  render,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close> & {
  render?: RenderProp
}) {
  return (
    <SheetPrimitive.Close
      data-slot="sheet-close"
      {...props}
      {...renderAsChild(render, children)}
    />
  )
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  initialFocus,
  finalFocus,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onInteractOutside,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  /** Base UI compat: element to focus when the sheet opens. */
  initialFocus?: React.RefObject<HTMLElement | null>
  /** Base UI compat: element to focus when the sheet closes. */
  finalFocus?: React.RefObject<HTMLElement | null>
}) {
  const dismissible = React.useContext(SheetDismissibleContext)
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event)
          if (!event.defaultPrevented && initialFocus?.current) {
            event.preventDefault()
            initialFocus.current.focus()
          }
        }}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event)
          if (!event.defaultPrevented && finalFocus?.current) {
            event.preventDefault()
            finalFocus.current.focus()
          }
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event)
          if (!dismissible) event.preventDefault()
        }}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[side=bottom]:data-[state=open]:slide-in-from-bottom-10 data-[side=left]:data-[state=open]:slide-in-from-left-10 data-[side=right]:data-[state=open]:slide-in-from-right-10 data-[side=top]:data-[state=open]:slide-in-from-top-10 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:data-[state=closed]:slide-out-to-bottom-10 data-[side=left]:data-[state=closed]:slide-out-to-left-10 data-[side=right]:data-[state=closed]:slide-out-to-right-10 data-[side=top]:data-[state=closed]:slide-out-to-top-10",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-3 right-3"
              size="icon-sm"
            >
              <XIcon
              />
              <span className="sr-only">Close</span>
            </Button>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title> & {
  render?: RenderProp
}) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn(
        "font-heading text-base font-medium text-foreground",
        className
      )}
      {...props}
      {...renderAsChild(render, children)}
    />
  )
}

function SheetDescription({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description> & {
  render?: RenderProp
}) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
      {...renderAsChild(render, children)}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
