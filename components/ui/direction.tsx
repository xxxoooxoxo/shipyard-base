"use client"

import * as React from "react"
import { Direction } from "radix-ui"

// Base UI compat: the old base-nova DirectionProvider took an OPTIONAL
// `direction` prop (defaulting to "ltr"), while Radix requires `dir`. Both
// spellings are accepted and optional so old call sites keep compiling.
function DirectionProvider({
  dir,
  direction,
  children,
}: Omit<
  React.ComponentProps<typeof Direction.DirectionProvider>,
  "dir"
> & {
  dir?: React.ComponentProps<typeof Direction.DirectionProvider>["dir"]
  direction?: React.ComponentProps<typeof Direction.DirectionProvider>["dir"]
}) {
  return (
    <Direction.DirectionProvider dir={direction ?? dir ?? "ltr"}>
      {children}
    </Direction.DirectionProvider>
  )
}

const useDirection = Direction.useDirection

export { DirectionProvider, useDirection }
