"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { renderAsChild, type RenderProp } from "@/lib/render"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"

// Base UI compat: the old base-nova Dialog.Root supported `dismissible` and an
// `onOpenChange(open, eventDetails)` signature. `dismissible` is threaded to
// the Content via context and mapped to Radix's onInteractOutside; the widened
// onOpenChange type keeps two-argument call sites compiling (the second
// argument is never provided by Radix).
const DialogDismissibleContext = React.createContext(true)

function Dialog({
  dismissible = true,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Root>, "onOpenChange"> & {
  /** Base UI compat: when false, interacting outside does not close the dialog. */
  dismissible?: boolean
  onOpenChange?: (
    open: boolean,
    eventDetails?: { reason?: string; event?: Event }
  ) => void
}) {
  return (
    <DialogDismissibleContext.Provider value={dismissible}>
      <DialogPrimitive.Root data-slot="dialog" {...props} />
    </DialogDismissibleContext.Provider>
  )
}

function DialogTrigger({
  render,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger> & {
  render?: RenderProp
}) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      {...props}
      {...renderAsChild(render, children)}
    />
  )
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  render,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
  render?: RenderProp
}) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      {...props}
      {...renderAsChild(render, children)}
    />
  )
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  initialFocus,
  finalFocus,
  onOpenAutoFocus,
  onCloseAutoFocus,
  onInteractOutside,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  /** Base UI compat: element to focus when the dialog opens. */
  initialFocus?: React.RefObject<HTMLElement | null>
  /** Base UI compat: element to focus when the dialog closes. */
  finalFocus?: React.RefObject<HTMLElement | null>
}) {
  const dismissible = React.useContext(DialogDismissibleContext)
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
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
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none sm:max-w-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2"
              size="icon-sm"
            >
              <XIcon
              />
              <span className="sr-only">Close</span>
            </Button>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t bg-muted/50 p-4 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title> & {
  render?: RenderProp
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "font-heading text-base leading-none font-medium",
        className
      )}
      {...props}
      {...renderAsChild(render, children)}
    />
  )
}

function DialogDescription({
  className,
  render,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description> & {
  render?: RenderProp
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground",
        className
      )}
      {...props}
      {...renderAsChild(render, children)}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
