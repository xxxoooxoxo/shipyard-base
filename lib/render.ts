import * as React from "react"

/**
 * Base UI compat: the old base-nova kit was built on Base UI, whose
 * components universally accept a polymorphic `render` prop
 * (`render={<a href="..." />}` or `render={(props, state) => <a {...props} />}`).
 * The Radix-based kit composes via `asChild` + Slot instead. This shim lets
 * existing call sites that pass `render` keep working: the rendered element is
 * used as the Slot child (with the wrapper's children merged into it when the
 * element has none of its own).
 */
type RenderProp =
  | React.ReactElement<Record<string, unknown>>
  | ((
      props: Record<string, unknown>,
      state: Record<string, unknown>
    ) => React.ReactElement<Record<string, unknown>>)

/**
 * Resolves a Base UI-style `render` prop into props for a Radix part:
 * `{ asChild: true, children: <element> }` when `render` is given, or just
 * `{ children }` when it is not. Spread the result *after* `{...props}`.
 */
function renderAsChild(
  render: RenderProp | undefined,
  children?: React.ReactNode
): { asChild?: boolean; children?: React.ReactNode } {
  if (!render) return { children }
  const element = typeof render === "function" ? render({}, {}) : render
  if (children != null && element.props.children == null) {
    return {
      asChild: true,
      children: React.cloneElement(element, undefined, children),
    }
  }
  return { asChild: true, children: element }
}

export { renderAsChild, type RenderProp }
