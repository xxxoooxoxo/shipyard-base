"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { Command as CommandPrimitive } from "cmdk"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react"

/* eslint-disable @typescript-eslint/no-explicit-any */

type ComboboxValueType = string | string[] | null

type ComboboxContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  value: ComboboxValueType
  setValue: (value: ComboboxValueType) => void
  selectValue: (value: string) => void
  inputValue: string
  setInputValue: (value: string) => void
  multiple: boolean
  items?: readonly any[]
  anchorRef: React.RefObject<HTMLDivElement | null>
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null)

function useCombobox() {
  const context = React.useContext(ComboboxContext)
  if (!context) {
    throw new Error("Combobox components must be used within <Combobox>.")
  }
  return context
}

const InsideContentContext = React.createContext(false)

function useControllableState<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (value: T) => void] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : uncontrolled
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange
  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) setUncontrolled(next)
      onChangeRef.current?.(next)
    },
    [isControlled]
  )
  return [value, setValue]
}

interface ComboboxProps {
  children?: React.ReactNode
  items?: readonly any[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  value?: ComboboxValueType
  defaultValue?: ComboboxValueType
  onValueChange?: (value: any) => void
  inputValue?: string
  defaultInputValue?: string
  onInputValueChange?: (value: string) => void
  multiple?: boolean
  shouldFilter?: boolean
  filter?: React.ComponentProps<typeof CommandPrimitive>["filter"]
  className?: string
}

function Combobox({
  children,
  items,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  value: valueProp,
  defaultValue,
  onValueChange,
  inputValue: inputValueProp,
  defaultInputValue = "",
  onInputValueChange,
  multiple = false,
  shouldFilter = true,
  filter,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useControllableState(
    openProp,
    defaultOpen,
    onOpenChange
  )
  const [value, setValue] = useControllableState<ComboboxValueType>(
    valueProp,
    defaultValue ?? (multiple ? [] : null),
    onValueChange
  )
  const [inputValue, setInputValue] = useControllableState(
    inputValueProp,
    defaultInputValue,
    onInputValueChange
  )
  const anchorRef = React.useRef<HTMLDivElement | null>(null)

  const selectValue = React.useCallback(
    (itemValue: string) => {
      if (multiple) {
        const current = Array.isArray(value) ? value : []
        setValue(
          current.includes(itemValue)
            ? current.filter((v) => v !== itemValue)
            : [...current, itemValue]
        )
        setInputValue("")
      } else {
        setValue(itemValue)
        setInputValue(itemValue)
        setOpen(false)
      }
    },
    [multiple, value, setValue, setInputValue, setOpen]
  )

  const context = React.useMemo<ComboboxContextValue>(
    () => ({
      open,
      setOpen,
      value,
      setValue,
      selectValue,
      inputValue,
      setInputValue,
      multiple,
      items,
      anchorRef,
    }),
    [
      open,
      setOpen,
      value,
      setValue,
      selectValue,
      inputValue,
      setInputValue,
      multiple,
      items,
    ]
  )

  return (
    <ComboboxContext.Provider value={context}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
        <CommandPrimitive
          data-slot="combobox"
          shouldFilter={shouldFilter}
          filter={filter}
          className={cn("contents", className)}
        >
          {children}
        </CommandPrimitive>
      </PopoverPrimitive.Root>
    </ComboboxContext.Provider>
  )
}

function ComboboxValue({
  className,
  placeholder,
  children,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  placeholder?: React.ReactNode
  children?: React.ReactNode | ((value: any) => React.ReactNode)
}) {
  const { value, multiple } = useCombobox()
  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : value != null && value !== ""

  let content: React.ReactNode
  if (typeof children === "function") {
    content = children(value)
  } else if (children != null) {
    content = children
  } else if (hasValue) {
    content = Array.isArray(value) ? value.join(", ") : value
  } else {
    content = <span className="text-muted-foreground">{placeholder}</span>
  }

  return (
    <span
      data-slot="combobox-value"
      className={cn("truncate", className)}
      {...props}
    >
      {content}
    </span>
  )
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
    </PopoverPrimitive.Trigger>
  )
}

function ComboboxClear({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof InputGroupButton>) {
  const { setValue, setInputValue, multiple } = useCombobox()
  return (
    <InputGroupButton
      data-slot="combobox-clear"
      variant="ghost"
      size="icon-xs"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event)
        setValue(multiple ? [] : null)
        setInputValue("")
      }}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </InputGroupButton>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  placeholder,
  ...props
}: Omit<
  React.ComponentProps<typeof CommandPrimitive.Input>,
  "value" | "onValueChange"
> & {
  showTrigger?: boolean
  showClear?: boolean
  children?: React.ReactNode
}) {
  const { open, setOpen, inputValue, setInputValue, anchorRef } = useCombobox()
  const insideContent = React.useContext(InsideContentContext)

  const inputGroup = (
    <InputGroup className={cn("w-auto", className)} ref={anchorRef}>
      <CommandPrimitive.Input
        asChild
        value={inputValue}
        onValueChange={(next) => {
          setInputValue(next)
          if (!insideContent && !open) setOpen(true)
        }}
        {...props}
      >
        <InputGroupInput
          disabled={disabled}
          placeholder={placeholder}
          onClick={() => {
            if (!insideContent) setOpen(true)
          }}
          onKeyDown={(event) => {
            if (
              !insideContent &&
              !open &&
              (event.key === "ArrowDown" || event.key === "ArrowUp")
            ) {
              setOpen(true)
            }
          }}
        />
      </CommandPrimitive.Input>
      <InputGroupAddon align="inline-end">
        {showTrigger && !insideContent && (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
            onClick={() => setOpen(!open)}
          >
            <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )

  if (insideContent) return inputGroup

  return (
    <PopoverPrimitive.Anchor asChild data-slot="combobox-anchor">
      {inputGroup}
    </PopoverPrimitive.Anchor>
  )
}

function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  anchor?: React.RefObject<HTMLElement | null>
}) {
  const { anchorRef } = useCombobox()
  return (
    <>
      {anchor && (
        <PopoverPrimitive.Anchor
          virtualRef={anchor as React.RefObject<HTMLElement>}
        />
      )}
      <PopoverPrimitive.Content
        data-slot="combobox-content"
        data-chips={!!anchor}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          const target = event.target as Node | null
          const anchorElement = anchor?.current ?? anchorRef.current
          if (target && anchorElement?.contains(target)) {
            event.preventDefault()
          }
        }}
        className={cn(
          "group/combobox-content relative isolate z-50 max-h-(--radix-popover-content-available-height) w-(--radix-popover-trigger-width) max-w-(--radix-popover-content-available-width) min-w-[calc(var(--radix-popover-trigger-width)+--spacing(7))] origin-(--radix-popover-content-transform-origin) overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[chips=true]:min-w-(--radix-popover-trigger-width) data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        {...props}
      >
        <InsideContentContext.Provider value={true}>
          {children}
        </InsideContentContext.Provider>
      </PopoverPrimitive.Content>
    </>
  )
}

function ComboboxList({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof CommandPrimitive.List>, "children"> & {
  children?: React.ReactNode | ((item: any, index: number) => React.ReactNode)
}) {
  const { items } = useCombobox()
  return (
    <CommandPrimitive.List
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--radix-popover-content-available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1",
        className
      )}
      {...props}
    >
      {typeof children === "function"
        ? (items ?? []).map((item, index) => children(item, index))
        : children}
    </CommandPrimitive.List>
  )
}

function ComboboxItem({
  className,
  children,
  value,
  onSelect,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  const { value: selectedValue, selectValue, multiple } = useCombobox()
  const itemValue = typeof value === "string" ? value : undefined
  const isSelected =
    itemValue != null &&
    (multiple
      ? Array.isArray(selectedValue) && selectedValue.includes(itemValue)
      : selectedValue === itemValue)

  return (
    <CommandPrimitive.Item
      data-slot="combobox-item"
      value={value}
      onSelect={(currentValue) => {
        selectValue(itemValue ?? currentValue)
        onSelect?.(currentValue)
      }}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none data-selected:bg-accent data-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        {isSelected && <CheckIcon className="pointer-events-none" />}
      </span>
    </CommandPrimitive.Item>
  )
}

function ComboboxGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  )
}

function ComboboxLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="combobox-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function ComboboxCollection({
  children,
  items: itemsProp,
}: {
  items?: readonly any[]
  children: (item: any, index: number) => React.ReactNode
}) {
  const { items } = useCombobox()
  const list = itemsProp ?? items ?? []
  return (
    <>
      {list.map((item, index) => (
        <React.Fragment key={index}>{children(item, index)}</React.Fragment>
      ))}
    </>
  )
}

function ComboboxEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "flex w-full justify-center py-2 text-center text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  ref,
  ...props
}: React.ComponentProps<"div">) {
  const { anchorRef, setOpen } = useCombobox()
  return (
    <PopoverPrimitive.Anchor asChild data-slot="combobox-anchor">
      <div
        data-slot="combobox-chips"
        ref={(node) => {
          anchorRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        onClick={(event) => {
          setOpen(true)
          event.currentTarget.querySelector("input")?.focus()
        }}
        className={cn(
          "flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Anchor>
  )
}

function ComboboxChip({
  className,
  children,
  value,
  showRemove = true,
  ...props
}: React.ComponentProps<"div"> & {
  value?: string
  showRemove?: boolean
}) {
  const { value: selectedValue, setValue, multiple } = useCombobox()
  const chipValue =
    value ?? (typeof children === "string" ? children : undefined)

  return (
    <div
      data-slot="combobox-chip"
      className={cn(
        "flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          data-slot="combobox-chip-remove"
          className="-ml-1 opacity-50 hover:opacity-100"
          onClick={(event) => {
            event.stopPropagation()
            if (chipValue == null) return
            if (multiple && Array.isArray(selectedValue)) {
              setValue(selectedValue.filter((v) => v !== chipValue))
            } else if (selectedValue === chipValue) {
              setValue(null)
            }
          }}
        >
          <XIcon className="pointer-events-none" />
        </Button>
      )}
    </div>
  )
}

function ComboboxChipsInput({
  className,
  ...props
}: Omit<
  React.ComponentProps<typeof CommandPrimitive.Input>,
  "value" | "onValueChange"
>) {
  const { open, setOpen, inputValue, setInputValue, value, setValue, multiple } =
    useCombobox()
  return (
    <CommandPrimitive.Input
      data-slot="combobox-chip-input"
      value={inputValue}
      onValueChange={(next) => {
        setInputValue(next)
        if (!open) setOpen(true)
      }}
      onKeyDown={(event) => {
        if (
          event.key === "Backspace" &&
          inputValue === "" &&
          multiple &&
          Array.isArray(value) &&
          value.length > 0
        ) {
          setValue(value.slice(0, -1))
        }
      }}
      onFocus={() => setOpen(true)}
      className={cn("min-w-16 flex-1 bg-transparent outline-none", className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
