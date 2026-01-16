# Theme Usage Guide

## ✅ Theme Successfully Applied

Your unified theme has been applied across all CSS files and major components have been updated to use theme variables.

## Theme Variables Reference

### Colors

#### Backgrounds
- `bg-background` - Main app background
- `bg-card` - Card/panel backgrounds
- `bg-popover` - Popover backgrounds
- `bg-muted` - Muted/subtle backgrounds

#### Text
- `text-foreground` - Primary text color
- `text-muted-foreground` - Secondary/muted text
- `text-card-foreground` - Text on cards
- `text-popover-foreground` - Text in popovers

#### Brand Colors
- `bg-primary` / `text-primary` - Primary purple accent
- `bg-primary-foreground` / `text-primary-foreground` - Text on primary
- `bg-secondary` / `text-secondary` - Secondary color
- `bg-accent` / `text-accent` - Accent highlights

#### Interactive
- `border-border` - Standard borders
- `border-input` - Input borders
- `ring-ring` - Focus rings
- `bg-destructive` - Error/danger states

### Sidebar
- `bg-sidebar` - Sidebar background
- `text-sidebar-foreground` - Sidebar text
- `bg-sidebar-primary` - Sidebar primary elements

### Charts
- `bg-chart-1` through `bg-chart-5` - Chart colors

## Updated Components

### ✅ Fully Themed
1. **app/globals.css** - Base theme
2. **app/page.tsx** - Landing page
3. **components/BuildInterface.tsx** - Main build interface
4. **components/LandingPage.tsx** - Landing component
5. **components/text_area/ProjectCreator.tsx** - Project creator
6. **components/ai_chat/Message.jsx** - Chat messages
7. **components/tools/CodeDrawer.tsx** - Code drawer

### Usage Examples

#### Buttons
```tsx
// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</button>

// Secondary button
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
  Secondary
</button>
```

#### Cards
```tsx
<div className="bg-card text-card-foreground border border-border rounded-lg p-4">
  Card content
</div>
```

#### Text
```tsx
<h1 className="text-foreground">Main heading</h1>
<p className="text-muted-foreground">Secondary text</p>
```

#### Inputs
```tsx
<input className="bg-background text-foreground border-input focus:ring-ring" />
```

## Best Practices

1. **Always use theme variables** instead of hardcoded colors
2. **Use opacity modifiers** for variations: `bg-primary/90`, `text-foreground/70`
3. **Leverage dark mode** - theme automatically handles light/dark variants
4. **Test both modes** - ensure components look good in light and dark themes

## Remaining Work

Some components may still have hardcoded colors. To find them:

```bash
# Search for hardcoded colors
grep -r "bg-\[" --include="*.tsx" --include="*.jsx"
grep -r "text-\[" --include="*.tsx" --include="*.jsx"
grep -r "bg-zinc" --include="*.tsx" --include="*.jsx"
grep -r "bg-gray" --include="*.tsx" --include="*.jsx"
```

Replace with appropriate theme variables from the list above.

## Theme Customization

To modify the theme, edit the CSS variables in:
- `app/globals.css`
- `ai_chat/app/globals.css`
- `Landing page/app/globals.css`
- `text_area/app/globals.css`

All components will automatically update to reflect the changes.
