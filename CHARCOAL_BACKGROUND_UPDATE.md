# Charcoal Background Update - AI Messages

## Change Applied

Updated AI message background color from `bg-gray-800` to charcoal `#272626`.

## Before
```tsx
"group-data-[from=assistant]:bg-gray-800 group-data-[from=assistant]:text-white"
```
- Color: `#1f2937` (Tailwind gray-800)

## After
```tsx
"group-data-[from=assistant]:bg-[#272626] group-data-[from=assistant]:text-white"
```
- Color: `#272626` (Custom charcoal)

## Implementation

Using Tailwind's arbitrary value syntax `bg-[#272626]` to apply the exact hex color.

### File Modified
`components/ui/message.tsx` - MessageContent component

### Code Change
```tsx
const MessageContent = React.forwardRef<HTMLDivElement, MessageContentProps>(
  ({ variant = "contained", className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1 rounded-2xl px-4 py-2.5 text-sm max-w-[85%]",
          variant === "contained" && [
            "shadow-sm",
            "group-data-[from=user]:bg-white group-data-[from=user]:text-gray-900",
            "group-data-[from=assistant]:bg-[#272626] group-data-[from=assistant]:text-white",
          ],
          variant === "flat" && [
            "group-data-[from=user]:bg-white group-data-[from=user]:text-gray-900 group-data-[from=user]:shadow-sm",
            "group-data-[from=assistant]:bg-[#272626] group-data-[from=assistant]:text-white",
          ],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
```

## Color Comparison

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Gray-800 (old) | `#1f2937` | Previous AI message background |
| Charcoal (new) | `#272626` | Current AI message background |
| White | `#ffffff` | User message background |

## Visual Result

### AI Message (Charcoal Background)
```
┌───┐  ┌─────────────────────────────────────────┐
│ Ω │  │ AI response text                        │
└───┘  │ Background: #272626 (charcoal)          │
       │ Text: #ffffff (white)                   │
       └─────────────────────────────────────────┘
```

### User Message (White Background)
```
       ┌─────────────────────────────────────────┐
       │ User message text                       │
       │ Background: #ffffff (white)             │
       │ Text: #111827 (gray-900)                │
       └─────────────────────────────────────────┘
```

## Status: ✅ COMPLETE

AI messages now display with charcoal background `#272626` as requested.
