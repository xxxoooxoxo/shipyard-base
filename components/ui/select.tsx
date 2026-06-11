"use client"

import * as React from "react"
import { Select as SelectPrimitive, Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

// Base UI compat: the old base-nova Select supported `multiple`, an `items`
// value→label map (used by <SelectValue> to render the trigger label), `null`
// as a first-class "no selection" value, and two-argument change callbacks
// (value, eventDetails). Radix Select is single-select only, so:
// - single-select renders Radix Select (null is mapped to "" so the
//   placeholder shows; the mapping is applied to both value and defaultValue),
// - `multiple` renders a Radix Popover-based listbox that implements
//   multi-select for real (toggling items keeps the popup open, values are
//   reported as string[], hidden inputs participate in forms via `name`).
type SelectChangeEventDetails = { reason?: string; event?: Event }

type SelectItems =
  | Record<string, React.ReactNode>
  | ReadonlyArray<{ value: string | null; label?: React.ReactNode }>

function getItemLabel(
  items: SelectItems | undefined,
  value: string
): React.ReactNode | undefined {
  if (!items) return undefined
  if (Array.isArray(items)) {
    return (
      items as ReadonlyArray<{ value: string | null; label?: React.ReactNode }>
    ).find((item) => item.value === value)?.label
  }
  return (items as Record<string, React.ReactNode>)[value]
}

type SelectMultipleContextValue = {
  values: string[]
  toggle: (value: string) => void
  items?: SelectItems
  disabled?: boolean
}

const SelectMultipleContext =
  React.createContext<SelectMultipleContextValue | null>(null)

const SelectSingleContext = React.createContext<{
  items?: SelectItems
  value: string | null
} | null>(null)

type SelectProps<Multiple extends boolean = false> = Omit<
  React.ComponentProps<typeof SelectPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "onOpenChange"
> & {
  /** Base UI compat: enables multi-select (values are `string[]`). */
  multiple?: Multiple
  /** Base UI compat: value→label map used by `<SelectValue>` for the trigger label. */
  items?: SelectItems
  /** Base UI compat: `null` (no selection) is accepted alongside strings. */
  value?: (Multiple extends true ? string[] : string) | null
  defaultValue?: (Multiple extends true ? string[] : string) | null
  onValueChange?: (
    value: Multiple extends true ? string[] : string,
    eventDetails?: SelectChangeEventDetails
  ) => void
  onOpenChange?: (
    open: boolean,
    eventDetails?: SelectChangeEventDetails
  ) => void
}

function Select<Multiple extends boolean = false>({
  multiple,
  ...props
}: SelectProps<Multiple>) {
  if (multiple) {
    return (
      <SelectMultiple
        {...(props as unknown as Omit<SelectProps<true>, "multiple">)}
      />
    )
  }
  return (
    <SelectSingle
      {...(props as unknown as Omit<SelectProps<false>, "multiple">)}
    />
  )
}

function SelectSingle({
  items,
  value,
  defaultValue,
  onValueChange,
  ...props
}: Omit<SelectProps<false>, "multiple">) {
  // Track the current value so <SelectValue> can map it through `items`.
  const [trackedValue, setTrackedValue] = React.useState<string | null>(
    defaultValue ?? null
  )
  const currentValue = value !== undefined ? value : trackedValue
  const contextValue = React.useMemo(
    () => ({ items, value: currentValue }),
    [items, currentValue]
  )
  return (
    <SelectSingleContext.Provider value={contextValue}>
      <SelectPrimitive.Root
        data-slot="select"
        value={value === undefined ? undefined : (value ?? "")}
        defaultValue={
          defaultValue === undefined ? undefined : (defaultValue ?? "")
        }
        onValueChange={(next) => {
          setTrackedValue(next)
          onValueChange?.(next)
        }}
        {...props}
      />
    </SelectSingleContext.Provider>
  )
}

function SelectMultiple({
  items,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen,
  onOpenChange,
  name,
  form,
  disabled,
  required: _required,
  autoComplete: _autoComplete,
  dir: _dir,
  children,
}: Omit<SelectProps<true>, "multiple">) {
  const isControlled = value !== undefined
  const [uncontrolledValues, setUncontrolledValues] = React.useState<string[]>(
    () => (defaultValue == null ? [] : [...defaultValue])
  )
  const values = isControlled ? (value ?? []) : uncontrolledValues
  const toggle = React.useCallback(
    (item: string) => {
      const next = values.includes(item)
        ? values.filter((v) => v !== item)
        : [...values, item]
      if (!isControlled) setUncontrolledValues(next)
      onValueChange?.(next)
    },
    [values, isControlled, onValueChange]
  )
  const contextValue = React.useMemo(
    () => ({ values, toggle, items, disabled }),
    [values, toggle, items, disabled]
  )
  return (
    <SelectMultipleContext.Provider value={contextValue}>
      <PopoverPrimitive.Root
        data-slot="select"
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={onOpenChange}
      >
        {children}
        {name
          ? values.map((v) => (
              <input key={v} type="hidden" name={name} form={form} value={v} />
            ))
          : null}
      </PopoverPrimitive.Root>
    </SelectMultipleContext.Provider>
  )
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  const multiple = React.useContext(SelectMultipleContext)
  if (multiple) {
    return (
      <div
        role="group"
        data-slot="select-group"
        className={cn("scroll-my-1 p-1", className)}
        {...(props as React.ComponentProps<"div">)}
      />
    )
  }
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  className,
  children,
  placeholder,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  const multiple = React.useContext(SelectMultipleContext)
  const single = React.useContext(SelectSingleContext)
  if (multiple) {
    const labels = multiple.values.map(
      (v) => getItemLabel(multiple.items, v) ?? v
    )
    const allText = labels.every(
      (label) => typeof label === "string" || typeof label === "number"
    )
    return (
      <span
        data-slot="select-value"
        className={cn("flex flex-1 text-left", className)}
        {...(props as React.ComponentProps<"span">)}
      >
        {children ??
          (labels.length === 0
            ? placeholder
            : allText
              ? labels.join(", ")
              : labels.map((label, index) => (
                  <React.Fragment key={index}>{label}</React.Fragment>
                )))}
      </span>
    )
  }
  const mappedLabel =
    single && single.value != null
      ? getItemLabel(single.items, single.value)
      : undefined
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      placeholder={placeholder}
      {...props}
    >
      {children ?? mappedLabel}
    </SelectPrimitive.Value>
  )
}

const selectTriggerClasses =
  "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  const multiple = React.useContext(SelectMultipleContext)
  if (multiple) {
    return (
      <PopoverPrimitive.Trigger
        type="button"
        role="combobox"
        data-slot="select-trigger"
        data-size={size}
        data-placeholder={multiple.values.length === 0 ? "" : undefined}
        disabled={multiple.disabled}
        className={cn(selectTriggerClasses, className)}
        {...(props as React.ComponentProps<typeof PopoverPrimitive.Trigger>)}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </PopoverPrimitive.Trigger>
    )
  }
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(selectTriggerClasses, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function handleMultipleListKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
  const options = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      '[role="option"]:not([data-disabled])'
    )
  )
  if (options.length === 0) return
  event.preventDefault()
  const index = options.indexOf(document.activeElement as HTMLElement)
  const next =
    event.key === "Home"
      ? options[0]
      : event.key === "End"
        ? options[options.length - 1]
        : event.key === "ArrowDown"
          ? options[Math.min(index + 1, options.length - 1)]
          : options[Math.max(index - 1, 0)]
  next?.focus()
}

function SelectContent({
  className,
  children,
  position,
  alignItemWithTrigger,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  onKeyDown,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  /**
   * Base UI compat: `false` maps to `position="popper"`; `true` (the old
   * default) maps to `position="item-aligned"`. An explicit `position` wins.
   */
  alignItemWithTrigger?: boolean
}) {
  const multiple = React.useContext(SelectMultipleContext)
  const resolvedPosition =
    position ?? (alignItemWithTrigger === false ? "popper" : "item-aligned")
  if (multiple) {
    return (
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          role="listbox"
          aria-multiselectable="true"
          data-slot="select-content"
          side={side}
          sideOffset={sideOffset}
          align={align}
          alignOffset={alignOffset}
          onKeyDown={(event) => {
            onKeyDown?.(event)
            if (!event.defaultPrevented) handleMultipleListKeyDown(event)
          }}
          className={cn(
            "relative z-50 max-h-(--radix-popover-content-available-height) min-w-(--radix-popover-trigger-width) origin-(--radix-popover-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            className
          )}
          {...(props as React.ComponentProps<typeof PopoverPrimitive.Content>)}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    )
  }
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={resolvedPosition === "item-aligned"}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        position={resolvedPosition}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        onKeyDown={onKeyDown}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={resolvedPosition}
          className="data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)"
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  const multiple = React.useContext(SelectMultipleContext)
  const labelClasses = cn("px-1.5 py-1 text-xs text-muted-foreground", className)
  if (multiple) {
    return (
      <div
        data-slot="select-label"
        className={labelClasses}
        {...(props as React.ComponentProps<"div">)}
      />
    )
  }
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={labelClasses}
      {...props}
    />
  )
}

const selectItemClasses =
  "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2"

function SelectItem({
  className,
  children,
  value,
  disabled,
  textValue,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  const multiple = React.useContext(SelectMultipleContext)
  if (multiple) {
    const selected = multiple.values.includes(value)
    const toggle = () => {
      if (!disabled) multiple.toggle(value)
    }
    return (
      <div
        role="option"
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        data-slot="select-item"
        data-state={selected ? "checked" : "unchecked"}
        data-disabled={disabled ? "" : undefined}
        tabIndex={disabled ? undefined : 0}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            toggle()
          }
        }}
        className={cn(selectItemClasses, className)}
        {...(props as React.ComponentProps<"div">)}
      >
        <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
          {selected ? <CheckIcon className="pointer-events-none" /> : null}
        </span>
        <span data-slot="select-item-text">{children}</span>
      </div>
    )
  }
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      value={value}
      disabled={disabled}
      textValue={textValue}
      className={cn(selectItemClasses, className)}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  const multiple = React.useContext(SelectMultipleContext)
  const separatorClasses = cn(
    "pointer-events-none -mx-1 my-1 h-px bg-border",
    className
  )
  if (multiple) {
    return (
      <div
        aria-hidden="true"
        data-slot="select-separator"
        className={separatorClasses}
        {...(props as React.ComponentProps<"div">)}
      />
    )
  }
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={separatorClasses}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  const multiple = React.useContext(SelectMultipleContext)
  if (multiple) return null
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  const multiple = React.useContext(SelectMultipleContext)
  if (multiple) return null
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
