# Toast

A feedback component for displaying temporary notification messages.

```tsx
'use client'
import { Button, toaster } from '@/components/ui'

export const App = () => {
  return (
    <div>
      <Button
        variant="outline"
        onClick={() =>
          toaster.create({
            title: 'Title',
            description: 'Description',
          })
        }
      >
        Add Toast
      </Button>
    </div>
  )
}

```

## Installation

Use the Park UI CLI to add the Toast component to your project:

```bash
npx @park-ui/cli add toast
```

## Usage

```tsx
import { Toaster, toaster } from "@/components/ui"
```

First, render the `Toaster` component in the root of your application.

```tsx
<Toaster />
```

Then, create a toast by calling the `toaster` function.

```tsx
toaster.create({
  title: "Toast Title",
  description: "Toast Description",
})
```

## Examples

### Closable 

Set the `closable` prop to `true` to create a closable toast.

```tsx
'use client'
import { Button, toaster } from '@/components/ui'

export const App = () => {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toaster.create({
          title: 'Title',
          description: 'Description',
          closable: true,
        })
      }
    >
      Add Toast
    </Button>
  )
}

```

### External Close

Use the `toaster.dismiss` method to close a toast.

- `toaster.dismiss(id)`: Dismiss a toast by its id.
- `toaster.dismiss()`: Dismiss all toasts.


```tsx
'use client'
import { Wrap } from 'styled-system/jsx'
import { Button, toaster } from '@/components/ui'

export const App = () => {
  return (
    <Wrap gap="4">
      <Button
        variant="outline"
        onClick={() =>
          toaster.create({
            title: 'Title',
            description: 'Description',
          })
        }
      >
        Add Toast
      </Button>
      <Button variant="outline" onClick={() => toaster.dismiss()}>
        Close Toasts
      </Button>
    </Wrap>
  )
}

```

### Types

Here's an example of each type of toast.

```tsx
'use client'
import { Wrap } from 'styled-system/jsx'
import { Button, toaster } from '@/components/ui'

export const App = () => {
  const types = ['success', 'error', 'warning', 'info'] as const

  return (
    <Wrap gap="4">
      {types.map((type) => (
        <Button
          variant="outline"
          key={type}
          onClick={() =>
            toaster.create({
              title: `Toast status is ${type}`,
              type: type,
              duration: 40000,
            })
          }
        >
          {type}
        </Button>
      ))}
    </Wrap>
  )
}

```

### With Action

Use the `action` and `actionLabel` prop to add an action to the toast.

> When the action trigger is clicked, the toast will be closed.

```tsx
'use client'
import { Button, toaster } from '@/components/ui'

export const App = () => {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() =>
        toaster.create({
          title: 'Title',
          description: 'Description',
          action: {
            label: 'Action',
            onClick: () =>
              toaster.success({
                title: 'Action',
                description: 'You clicked the action button',
              }),
          },
        })
      }
    >
      Add Toast
    </Button>
  )
}

```

### Promise

Use the `toaster.promise` to create a toast that resolves when the promise is resolved.

Next, you can define the toast options (title, description, etc.) for each state of the promise.

```tsx
'use client'
import { Button, toaster } from '@/components/ui'

export const App = () => {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        const fileUploadTask = new Promise<void>((resolve) => {
          setTimeout(() => resolve(), 2000)
        })

        toaster.promise(fileUploadTask, {
          success: {
            title: 'Successfully uploaded!',
            description: 'Looks great',
          },
          error: {
            title: 'Upload failed',
            description: 'Something wrong with the upload',
          },
          loading: { title: 'Uploading...', description: 'Please wait' },
        })
      }}
    >
      Add Toast
    </Button>
  )
}

```

### Custom Duration

Use the `duration` prop to set the duration of the toast.

```tsx
'use client'
import { Button, toaster } from '@/components/ui'

export const App = () => {
  return (
    <div>
      <Button
        variant="outline"
        onClick={() =>
          toaster.create({
            title: 'Title',
            description: 'Description',
            duration: 6000,
          })
        }
      >
        Add Toast
      </Button>
    </div>
  )
}

```

### Maximum Visible Toasts

Set the `max` prop on the `createToaster` function to define the maximum number of toasts that can be rendered at any one time.
Any extra toasts will be queued and rendered when a toast has been dismissed.

```tsx
const toaster = createToaster({
  max: 3,
})
```

### Placement

Toasts can be displayed on all four corners of a page. We recommend picking one desired position and configure it in the `createToaster` function.

```tsx
const toaster = createToaster({
  placement: "top-end",
})

```
### Stacked Toasts

By default, toasts overlap each other. To make the toasts stack on top of each other, set the `overlap` prop to `false` in the `createToaster` function.

```tsx
const toaster = createToaster({
  placement: "top-end",
  overlap: false,
})
```

### Page Idle Behavior

Pause toast timers when the page is idle/hidden.

```tsx
const toaster = createToaster({
  pauseOnPageIdle: true,
})
```

### Offset

Set the `offsets` prop in the `createToaster` function to offset the toasts from the edges of the screen.

```tsx
const toaster = createToaster({
  offsets: "20px",
})
```

Alternatively, you can use the `offsets` prop to set the offset for each edge of the screen.

```tsx
const toaster = createToaster({
  offsets: { left: "20px", top: "20px", right: "20px", bottom: "20px" },
})
```

## Props

| Prop | Default | Type |
| --- | --- | --- |
| `asChild` | - | `boolean`<br/>Use the provided child element as the default rendered element, combining their props and behavior. |