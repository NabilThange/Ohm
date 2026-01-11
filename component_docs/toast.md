<ComponentPreview id="Toast" />

## Anatomy

To set up the toast correctly, you'll need to understand its anatomy and how we name its parts.

> Each part includes a `data-part` attribute to help identify them in the DOM.

<Anatomy id="toast" />

## Setup

To use the Toast component, create the toast engine using the `createToaster` function.

This function manages the placement and grouping of toasts, and provides a `toast` object needed to create toast
notification.

```ts
const toaster = createToaster({
  placement: 'bottom-end',
  overlap: true,
  gap: 24,
})
```

## Examples

Here's an example of creating a toast using the `toast.create` method.

**Example: basic**

#### React

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/react/toast'
import { XIcon } from 'lucide-react'

const toaster = createToaster({
  placement: 'bottom-end',
  overlap: true,
  gap: 24,
})

export const Basic = () => {
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          toaster.create({
            title: 'Toast Title',
            description: 'Toast Description',
            type: 'info',
          })
        }
      >
        Add Toast
      </button>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            <Toast.Title>{toast.title}</Toast.Title>
            <Toast.Description>{toast.description}</Toast.Description>
            <Toast.CloseTrigger>
              <XIcon />
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Solid

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/solid/toast'
import { XIcon } from 'lucide-solid'

export const Basic = () => {
  const toaster = createToaster({
    placement: 'bottom-end',
    gap: 24,
  })

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          toaster.create({
            title: 'Loading!',
            description: 'We are loading something for you. Please wait.',
            type: 'info',
          })
        }
      >
        Add Toast
      </button>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast().title}</Toast.Title>
            <Toast.Description>{toast().description}</Toast.Description>
            <Toast.CloseTrigger>
              <XIcon />
            </Toast.CloseTrigger>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Vue

```vue
<script setup lang="ts">
import { Toast, Toaster, createToaster } from '@ark-ui/vue/toast'

const toaster = createToaster({ placement: 'bottom-end', overlap: true, gap: 24 })

const createToast = () => {
  toaster.create({
    title: 'Title',
    description: 'Description',
    type: 'info',
  })
}
</script>

<template>
  <button @click="createToast">Create Toast</button>
  <Toaster :toaster="toaster" v-slot="toast">
    <Toast.Root>
      <Toast.Title>{{ toast.title }}</Toast.Title>
      <Toast.Description>{{ toast.description }}</Toast.Description>
      <Toast.ActionTrigger>Action</Toast.ActionTrigger>
      <Toast.CloseTrigger>Close</Toast.CloseTrigger>
    </Toast.Root>
  </Toaster>
</template>

```

#### Svelte

```svelte
<script lang="ts">
  import { Toast, Toaster, createToaster } from '@ark-ui/svelte/toast'
  import { X } from 'lucide-svelte'

  const toaster = createToaster({
    placement: 'bottom-end',
    overlap: true,
    gap: 24,
  })

  function addToast() {
    toaster.create({
      title: 'Toast Title',
      description: 'Toast Description',
      type: 'info',
    })
  }
</script>

<div>
  <button type="button" onclick={addToast}>Add Toast</button>
  <Toaster {toaster}>
    {#snippet children(toast)}
      <Toast.Root>
        <Toast.Title>{toast().title}</Toast.Title>
        <Toast.Description>{toast().description}</Toast.Description>
        <Toast.CloseTrigger>
          <X />
        </Toast.CloseTrigger>
      </Toast.Root>
    {/snippet}
  </Toaster>
</div>

```

### Toast Types

You can create different types of toasts (`success`, `error`, `warning`, `info`) with appropriate styling. For example,
to create a success toast, you can do:

```ts
toaster.success({
  title: 'Success!',
  description: 'Your changes have been saved.',
})
```

**Example: types**

#### React

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/react/toast'
import { CircleAlertIcon, TriangleAlertIcon, CircleCheckIcon, InfoIcon, X } from 'lucide-react'

const toaster = createToaster({
  overlap: true,
  placement: 'bottom-end',
  gap: 16,
})

const iconMap = {
  success: CircleCheckIcon,
  error: CircleAlertIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
}

export const Types = () => {
  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => toaster.success({ title: 'Success!', description: 'Your changes have been saved.' })}
        >
          Success
        </button>
        <button
          type="button"
          onClick={() =>
            toaster.error({ title: 'Error occurred', description: 'Something went wrong. Please try again.' })
          }
        >
          Error
        </button>
        <button
          type="button"
          onClick={() => toaster.warning({ title: 'Warning', description: 'This action cannot be undone.' })}
        >
          Warning
        </button>
        <button
          type="button"
          onClick={() =>
            toaster.info({ title: 'New update available', description: 'Version 2.1.0 is now available for download.' })
          }
        >
          Info
        </button>
      </div>

      <Toaster toaster={toaster}>
        {(toast) => {
          const ToastIcon = toast.type ? iconMap[toast.type as keyof typeof iconMap] : undefined
          return (
            <Toast.Root key={toast.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {ToastIcon && <ToastIcon />}
                <div style={{ flex: 1 }}>
                  <Toast.Title>{toast.title}</Toast.Title>
                  <Toast.Description>{toast.description}</Toast.Description>
                </div>
                <Toast.CloseTrigger>
                  <X />
                </Toast.CloseTrigger>
              </div>
            </Toast.Root>
          )
        }}
      </Toaster>
    </div>
  )
}

```

#### Solid

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/solid/toast'
import { CircleAlertIcon, TriangleAlertIcon, CircleCheckIcon, InfoIcon, XIcon } from 'lucide-solid'
import { Dynamic } from 'solid-js/web'

const iconMap = {
  success: CircleCheckIcon,
  error: CircleAlertIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
}

export const Types = () => {
  const toaster = createToaster({
    overlap: true,
    placement: 'bottom-end',
    gap: 16,
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', 'flex-wrap': 'wrap' }}>
        <button
          type="button"
          onClick={() => toaster.success({ title: 'Success!', description: 'Your changes have been saved.' })}
        >
          Success
        </button>
        <button
          type="button"
          onClick={() =>
            toaster.error({ title: 'Error occurred', description: 'Something went wrong. Please try again.' })
          }
        >
          Error
        </button>
        <button
          type="button"
          onClick={() => toaster.warning({ title: 'Warning', description: 'This action cannot be undone.' })}
        >
          Warning
        </button>
        <button
          type="button"
          onClick={() =>
            toaster.info({ title: 'New update available', description: 'Version 2.1.0 is now available for download.' })
          }
        >
          Info
        </button>
      </div>

      <Toaster toaster={toaster}>
        {(toast) => {
          const icon = () => (toast().type ? iconMap[toast().type as keyof typeof iconMap] : InfoIcon)
          return (
            <Toast.Root>
              <div style={{ display: 'flex', 'align-items': 'flex-start', gap: '12px' }}>
                <Dynamic component={icon()} />
                <div style={{ flex: 1 }}>
                  <Toast.Title>{toast().title}</Toast.Title>
                  <Toast.Description>{toast().description}</Toast.Description>
                </div>
                <Toast.CloseTrigger>
                  <XIcon />
                </Toast.CloseTrigger>
              </div>
            </Toast.Root>
          )
        }}
      </Toaster>
    </div>
  )
}

```

#### Vue

```vue
<script setup lang="ts">
import { Toast, Toaster, createToaster } from '@ark-ui/vue/toast'
import { CircleAlertIcon, TriangleAlertIcon, CircleCheckIcon, InfoIcon, X } from 'lucide-vue-next'

const toaster = createToaster({
  overlap: true,
  placement: 'bottom-end',
  gap: 16,
})

const iconMap = {
  success: CircleCheckIcon,
  error: CircleAlertIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
}
</script>

<template>
  <div>
    <div style="display: flex; gap: 12px; flex-wrap: wrap">
      <button
        type="button"
        @click="toaster.success({ title: 'Success!', description: 'Your changes have been saved.' })"
      >
        Success
      </button>
      <button
        type="button"
        @click="toaster.error({ title: 'Error occurred', description: 'Something went wrong. Please try again.' })"
      >
        Error
      </button>
      <button
        type="button"
        @click="toaster.warning({ title: 'Warning', description: 'This action cannot be undone.' })"
      >
        Warning
      </button>
      <button
        type="button"
        @click="
          toaster.info({ title: 'New update available', description: 'Version 2.1.0 is now available for download.' })
        "
      >
        Info
      </button>
    </div>

    <Toaster :toaster="toaster" v-slot="toast">
      <Toast.Root>
        <div style="display: flex; align-items: flex-start; gap: 12px">
          <component :is="toast.type ? iconMap[toast.type as keyof typeof iconMap] : InfoIcon" />
          <div style="flex: 1">
            <Toast.Title>{{ toast.title }}</Toast.Title>
            <Toast.Description>{{ toast.description }}</Toast.Description>
          </div>
          <Toast.CloseTrigger>
            <X />
          </Toast.CloseTrigger>
        </div>
      </Toast.Root>
    </Toaster>
  </div>
</template>

```

#### Svelte

```svelte
<script lang="ts">
  import { Toast, Toaster, createToaster } from '@ark-ui/svelte/toast'
  import { CircleAlertIcon, TriangleAlertIcon, CircleCheckIcon, InfoIcon, X } from 'lucide-svelte'

  const toaster = createToaster({
    overlap: true,
    placement: 'bottom-end',
    gap: 16,
  })

  const iconMap = {
    success: CircleCheckIcon,
    error: CircleAlertIcon,
    warning: TriangleAlertIcon,
    info: InfoIcon,
  }
</script>

<div>
  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
    <button
      type="button"
      onclick={() => toaster.success({ title: 'Success!', description: 'Your changes have been saved.' })}
    >
      Success
    </button>
    <button
      type="button"
      onclick={() => toaster.error({ title: 'Error occurred', description: 'Something went wrong. Please try again.' })}
    >
      Error
    </button>
    <button
      type="button"
      onclick={() => toaster.warning({ title: 'Warning', description: 'This action cannot be undone.' })}
    >
      Warning
    </button>
    <button
      type="button"
      onclick={() =>
        toaster.info({ title: 'New update available', description: 'Version 2.1.0 is now available for download.' })}
    >
      Info
    </button>
  </div>

  <Toaster {toaster}>
    {#snippet children(toast)}
      {@const icon = toast().type ? iconMap[toast().type as keyof typeof iconMap] : InfoIcon}
      <Toast.Root>
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <svelte:component this={icon} />
          <div style="flex: 1;">
            <Toast.Title>{toast().title}</Toast.Title>
            <Toast.Description>{toast().description}</Toast.Description>
          </div>
          <Toast.CloseTrigger>
            <X />
          </Toast.CloseTrigger>
        </div>
      </Toast.Root>
    {/snippet}
  </Toaster>
</div>

```

### Promise

You can use `toaster.promise()` to automatically handle the different states of an asynchronous operation. It provides
options for the `success`, `error`, and `loading` states of the promise and will automatically update the toast when the
promise resolves or rejects.

**Example: promise-toast**

#### React

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/react/toast'
import { XIcon, LoaderIcon, CircleCheckIcon, CircleAlertIcon } from 'lucide-react'

const toaster = createToaster({
  overlap: true,
  placement: 'bottom-end',
  gap: 16,
})

const uploadFile = () => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.5 ? resolve() : reject(new Error('Upload failed'))
    }, 2000)
  })
}

export const PromiseToast = () => {
  const handleUpload = async () => {
    toaster.promise(uploadFile, {
      loading: {
        title: 'Uploading...',
        description: 'Please wait while we process your request.',
      },
      success: {
        title: 'Success!',
        description: 'Your request has been processed successfully.',
      },
      error: {
        title: 'Failed',
        description: 'Something went wrong. Please try again.',
      },
    })
  }

  const getIcon = (type: string | undefined) => {
    switch (type) {
      case 'loading':
        return <LoaderIcon size={20} style={{ animation: 'spin 1s linear infinite' }} />
      case 'success':
        return <CircleCheckIcon size={20} />
      case 'error':
        return <CircleAlertIcon size={20} />
      default:
        return null
    }
  }

  return (
    <div>
      <button type="button" onClick={handleUpload}>
        Start Process
      </button>

      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {getIcon(toast.type)}
              <div style={{ flex: 1 }}>
                <Toast.Title>{toast.title}</Toast.Title>
                <Toast.Description>{toast.description}</Toast.Description>
              </div>
              <Toast.CloseTrigger>
                <XIcon />
              </Toast.CloseTrigger>
            </div>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Solid

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/solid/toast'
import { CircleAlertIcon, CircleCheckIcon, InfoIcon, LoaderIcon, XIcon } from 'lucide-solid'
import { Dynamic } from 'solid-js/web'

const uploadFile = () => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.5 ? resolve() : reject(new Error('Upload failed'))
    }, 2000)
  })
}

export const PromiseToast = () => {
  const toaster = createToaster({
    overlap: true,
    placement: 'bottom-end',
    gap: 16,
  })

  const handleUpload = async () => {
    toaster.promise(uploadFile, {
      loading: {
        title: 'Uploading...',
        description: 'Please wait while we process your request.',
      },
      success: {
        title: 'Success!',
        description: 'Your request has been processed successfully.',
      },
      error: {
        title: 'Failed',
        description: 'Something went wrong. Please try again.',
      },
    })
  }

  const getIcon = (type: string | undefined) => {
    switch (type) {
      case 'loading':
        return LoaderIcon
      case 'success':
        return CircleCheckIcon
      case 'error':
        return CircleAlertIcon
      default:
        return InfoIcon
    }
  }

  return (
    <div>
      <button type="button" onClick={handleUpload}>
        Start Process
      </button>

      <Toaster toaster={toaster}>
        {(toast) => {
          const icon = () => getIcon(toast().type)
          return (
            <Toast.Root>
              <div style={{ display: 'flex', 'align-items': 'flex-start', gap: '12px' }}>
                <Dynamic
                  component={icon()}
                  style={toast().type === 'loading' ? { animation: 'spin 1s linear infinite' } : {}}
                />
                <div style={{ flex: 1 }}>
                  <Toast.Title>{toast().title}</Toast.Title>
                  <Toast.Description>{toast().description}</Toast.Description>
                </div>
                <Toast.CloseTrigger>
                  <XIcon />
                </Toast.CloseTrigger>
              </div>
            </Toast.Root>
          )
        }}
      </Toaster>
    </div>
  )
}

```

#### Vue

```vue
<script setup lang="ts">
import { Toast, Toaster, createToaster } from '@ark-ui/vue/toast'
import { XIcon, LoaderIcon, CircleCheckIcon, CircleAlertIcon } from 'lucide-vue-next'

const toaster = createToaster({
  overlap: true,
  placement: 'bottom-end',
  gap: 16,
})

const uploadFile = () => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      Math.random() > 0.5 ? resolve() : reject(new Error('Upload failed'))
    }, 2000)
  })
}

const handleUpload = async () => {
  toaster.promise(uploadFile, {
    loading: {
      title: 'Uploading...',
      description: 'Please wait while we process your request.',
    },
    success: {
      title: 'Success!',
      description: 'Your request has been processed successfully.',
    },
    error: {
      title: 'Failed',
      description: 'Something went wrong. Please try again.',
    },
  })
}

const iconMap = {
  loading: LoaderIcon,
  success: CircleCheckIcon,
  error: CircleAlertIcon,
}
</script>

<template>
  <div>
    <button type="button" @click="handleUpload">Start Process</button>

    <Toaster :toaster="toaster" v-slot="toast">
      <Toast.Root>
        <div style="display: flex; align-items: flex-start; gap: 12px">
          <component
            :is="toast.type ? iconMap[toast.type as keyof typeof iconMap] : undefined"
            :style="toast.type === 'loading' ? 'animation: spin 1s linear infinite;' : ''"
          />
          <div style="flex: 1">
            <Toast.Title>{{ toast.title }}</Toast.Title>
            <Toast.Description>{{ toast.description }}</Toast.Description>
          </div>
          <Toast.CloseTrigger>
            <XIcon />
          </Toast.CloseTrigger>
        </div>
      </Toast.Root>
    </Toaster>
  </div>
</template>

```

#### Svelte

```svelte
<script lang="ts">
  import { Toast, Toaster, createToaster } from '@ark-ui/svelte/toast'
  import { XIcon, LoaderIcon, CircleCheckIcon, CircleAlertIcon } from 'lucide-svelte'

  const toaster = createToaster({
    overlap: true,
    placement: 'bottom-end',
    gap: 16,
  })

  const uploadFile = () => {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve() : reject(new Error('Upload failed'))
      }, 2000)
    })
  }

  const handleUpload = async () => {
    toaster.promise(uploadFile, {
      loading: {
        title: 'Uploading...',
        description: 'Please wait while we process your request.',
      },
      success: {
        title: 'Success!',
        description: 'Your request has been processed successfully.',
      },
      error: {
        title: 'Failed',
        description: 'Something went wrong. Please try again.',
      },
    })
  }

  const iconMap = {
    loading: LoaderIcon,
    success: CircleCheckIcon,
    error: CircleAlertIcon,
  }
</script>

<div>
  <button type="button" onclick={handleUpload}>Start Process</button>

  <Toaster {toaster}>
    {#snippet children(toast)}
      {@const icon = toast().type ? iconMap[toast().type as keyof typeof iconMap] : undefined}
      <Toast.Root>
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          {#if icon}
            <svelte:component
              this={icon}
              style={toast().type === 'loading' ? 'animation: spin 1s linear infinite;' : ''}
            />
          {/if}
          <div style="flex: 1;">
            <Toast.Title>{toast().title}</Toast.Title>
            <Toast.Description>{toast().description}</Toast.Description>
          </div>
          <Toast.CloseTrigger>
            <XIcon />
          </Toast.CloseTrigger>
        </div>
      </Toast.Root>
    {/snippet}
  </Toaster>
</div>

```

### Update Toast

To update a toast, use the `toast.update` method.

**Example: update**

#### React

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/react/toast'
import { useRef } from 'react'

const toaster = createToaster({
  placement: 'bottom-end',
  overlap: true,
  gap: 24,
})

export const Update = () => {
  const id = useRef<string>(undefined)

  const createToast = () => {
    id.current = toaster.create({
      title: 'Loading',
      description: 'Loading ...',
      type: 'info',
    })
  }

  const updateToast = () => {
    if (!id.current) {
      return
    }
    toaster.update(id.current, {
      title: 'Success',
      description: 'Success!',
    })
  }

  return (
    <div>
      <button type="button" onClick={createToast}>
        Create Toast
      </button>
      <button type="button" onClick={updateToast}>
        Update Toast
      </button>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            <Toast.Title>{toast.title}</Toast.Title>
            <Toast.Description>{toast.description}</Toast.Description>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Solid

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/solid/toast'
import { createSignal } from 'solid-js'

const toaster = createToaster({
  placement: 'bottom-end',
  overlap: true,
  gap: 24,
})

export const Update = () => {
  const [id, setId] = createSignal<string | undefined>(undefined)

  const createToast = () => {
    const newId = toaster.create({
      title: 'Loading',
      description: 'Loading ...',
      type: 'info',
    })
    setId(newId)
  }

  const updateToast = () => {
    const currentId = id()
    if (!currentId) {
      return
    }
    toaster.update(currentId, {
      title: 'Success',
      description: 'Success!',
    })
  }

  return (
    <div>
      <button type="button" onClick={createToast}>
        Create Toast
      </button>
      <button type="button" onClick={updateToast}>
        Update Toast
      </button>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast().title}</Toast.Title>
            <Toast.Description>{toast().description}</Toast.Description>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Vue

```vue
<script setup lang="ts">
import { Toast, Toaster, createToaster } from '@ark-ui/vue/toast'
import { ref } from 'vue'

const toaster = createToaster({
  placement: 'bottom-end',
  overlap: true,
  gap: 24,
})

const id = ref<string | undefined>(undefined)

const createToast = () => {
  id.value = toaster.create({
    title: 'Loading',
    description: 'Loading ...',
    type: 'info',
  })
}

const updateToast = () => {
  if (!id.value) {
    return
  }
  toaster.update(id.value, {
    title: 'Success',
    description: 'Success!',
  })
}
</script>

<template>
  <div>
    <button type="button" @click="createToast">Create Toast</button>
    <button type="button" @click="updateToast">Update Toast</button>
    <Toaster :toaster="toaster" v-slot="toast">
      <Toast.Root>
        <Toast.Title>{{ toast.title }}</Toast.Title>
        <Toast.Description>{{ toast.description }}</Toast.Description>
      </Toast.Root>
    </Toaster>
  </div>
</template>

```

#### Svelte

```svelte
<script lang="ts">
  import { Toast, Toaster, createToaster } from '@ark-ui/svelte/toast'

  const toaster = createToaster({
    placement: 'bottom-end',
    overlap: true,
    gap: 24,
  })

  let toastId: string | undefined = $state()

  function createToast() {
    toastId = toaster.create({
      title: 'Loading',
      description: 'Loading ...',
      type: 'info',
    })
  }

  function updateToast() {
    if (!toastId) {
      return
    }
    toaster.update(toastId, {
      title: 'Success',
      description: 'Success!',
    })
  }
</script>

<div>
  <button type="button" onclick={createToast}>Create Toast</button>
  <button type="button" onclick={updateToast}>Update Toast</button>
  <Toaster {toaster}>
    {#snippet children(toast)}
      <Toast.Root>
        <Toast.Title>{toast().title}</Toast.Title>
        <Toast.Description>{toast().description}</Toast.Description>
      </Toast.Root>
    {/snippet}
  </Toaster>
</div>

```

### Action

To add an action to a toast, use the `toast.action` property.

**Example: action**

#### React

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/react/toast'

const toaster = createToaster({
  placement: 'bottom-end',
  gap: 24,
})

export const Action = () => {
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          toaster.create({
            title: 'Toast Title',
            description: 'Toast Description',
            type: 'info',
            action: {
              label: 'Subscribe',
              onClick: () => {
                console.log('Subscribe')
              },
            },
          })
        }
      >
        Add Toast
      </button>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            <Toast.Title>{toast.title}</Toast.Title>
            <Toast.Description>{toast.description}</Toast.Description>
            {toast.action && <Toast.ActionTrigger>{toast.action?.label}</Toast.ActionTrigger>}
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Solid

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/solid/toast'

const toaster = createToaster({
  placement: 'bottom-end',
  gap: 24,
})

export const Action = () => {
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          toaster.create({
            title: 'Toast Title',
            description: 'Toast Description',
            type: 'info',
            action: {
              label: 'Subscribe',
              onClick: () => {
                console.log('Subscribe')
              },
            },
          })
        }
      >
        Add Toast
      </button>
      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <Toast.Title>{toast().title}</Toast.Title>
            <Toast.Description>{toast().description}</Toast.Description>
            {toast().action && <Toast.ActionTrigger>{toast().action?.label}</Toast.ActionTrigger>}
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Vue

```vue
<script setup lang="ts">
import { Toast, Toaster, createToaster } from '@ark-ui/vue/toast'

const toaster = createToaster({
  placement: 'bottom-end',
  gap: 24,
})

const addToast = () => {
  toaster.create({
    title: 'Toast Title',
    description: 'Toast Description',
    type: 'info',
    action: {
      label: 'Subscribe',
      onClick: () => {
        console.log('Subscribe')
      },
    },
  })
}
</script>

<template>
  <div>
    <button type="button" @click="addToast">Add Toast</button>
    <Toaster :toaster="toaster" v-slot="toast">
      <Toast.Root>
        <Toast.Title>{{ toast.title }}</Toast.Title>
        <Toast.Description>{{ toast.description }}</Toast.Description>
        <Toast.ActionTrigger v-if="toast.action">{{ toast.action?.label }}</Toast.ActionTrigger>
      </Toast.Root>
    </Toaster>
  </div>
</template>

```

#### Svelte

```svelte
<script lang="ts">
  import { Toast, Toaster, createToaster } from '@ark-ui/svelte/toast'

  const toaster = createToaster({
    placement: 'bottom-end',
    gap: 24,
  })

  function addToast() {
    toaster.create({
      title: 'Toast Title',
      description: 'Toast Description',
      type: 'info',
      action: {
        label: 'Subscribe',
        onClick: () => {
          console.log('Subscribe')
        },
      },
    })
  }
</script>

<div>
  <button type="button" onclick={addToast}>Add Toast</button>
  <Toaster {toaster}>
    {#snippet children(toast)}
      <Toast.Root>
        <Toast.Title>{toast().title}</Toast.Title>
        <Toast.Description>{toast().description}</Toast.Description>
        {#if toast().action}
          <Toast.ActionTrigger>{toast().action?.label}</Toast.ActionTrigger>
        {/if}
      </Toast.Root>
    {/snippet}
  </Toaster>
</div>

```

### Custom Duration

You can control how long a toast stays visible by setting a custom `duration` in milliseconds, or use `Infinity` to keep
it visible until manually dismissed.

**Example: duration**

#### React

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/react/toast'
import { XIcon, ClockIcon } from 'lucide-react'

const toaster = createToaster({
  overlap: true,
  placement: 'bottom-end',
  gap: 16,
})

const durations = [
  { label: '1s', value: 1000 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '∞', value: Infinity },
]

export const Duration = () => {
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {durations.map((duration) => (
          <button
            key={duration.label}
            type="button"
            onClick={() =>
              toaster.create({
                title: `Toast (${duration.label})`,
                description: `This toast will ${
                  duration.value === Infinity ? 'stay until dismissed' : `disappear in ${duration.label}`
                }.`,
                type: 'info',
                duration: duration.value,
              })
            }
          >
            {duration.label}
          </button>
        ))}
      </div>

      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <ClockIcon />
              <div style={{ flex: 1 }}>
                <Toast.Title>{toast.title}</Toast.Title>
                <Toast.Description>{toast.description}</Toast.Description>
              </div>
              <Toast.CloseTrigger>
                <XIcon />
              </Toast.CloseTrigger>
            </div>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Solid

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/solid/toast'
import { XIcon, ClockIcon } from 'lucide-solid'
import { For } from 'solid-js'

const durations = [
  { label: '1s', value: 1000 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '∞', value: Infinity },
]

export const Duration = () => {
  const toaster = createToaster({
    overlap: true,
    placement: 'bottom-end',
    gap: 16,
  })

  return (
    <div>
      <div style={{ display: 'flex', 'flex-wrap': 'wrap', gap: '8px' }}>
        <For each={durations}>
          {(duration) => (
            <button
              type="button"
              onClick={() =>
                toaster.create({
                  title: `Toast (${duration.label})`,
                  description: `This toast will ${
                    duration.value === Infinity ? 'stay until dismissed' : `disappear in ${duration.label}`
                  }.`,
                  type: 'info',
                  duration: duration.value,
                })
              }
            >
              {duration.label}
            </button>
          )}
        </For>
      </div>

      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <div style={{ display: 'flex', 'align-items': 'flex-start', gap: '12px' }}>
              <ClockIcon />
              <div style={{ flex: 1 }}>
                <Toast.Title>{toast().title}</Toast.Title>
                <Toast.Description>{toast().description}</Toast.Description>
              </div>
              <Toast.CloseTrigger>
                <XIcon />
              </Toast.CloseTrigger>
            </div>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Vue

```vue
<script setup lang="ts">
import { Toast, Toaster, createToaster } from '@ark-ui/vue/toast'
import { XIcon, ClockIcon } from 'lucide-vue-next'

const toaster = createToaster({
  overlap: true,
  placement: 'bottom-end',
  gap: 16,
})

const durations = [
  { label: '1s', value: 1000 },
  { label: '3s', value: 3000 },
  { label: '5s', value: 5000 },
  { label: '∞', value: Infinity },
]
</script>

<template>
  <div>
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <button
        v-for="duration in durations"
        :key="duration.label"
        type="button"
        @click="
          toaster.create({
            title: `Toast (${duration.label})`,
            description: `This toast will ${
              duration.value === Infinity ? 'stay until dismissed' : `disappear in ${duration.label}`
            }.`,
            type: 'info',
            duration: duration.value,
          })
        "
      >
        {{ duration.label }}
      </button>
    </div>

    <Toaster :toaster="toaster" v-slot="toast">
      <Toast.Root>
        <div style="display: flex; align-items: flex-start; gap: 12px">
          <ClockIcon />
          <div style="flex: 1">
            <Toast.Title>{{ toast.title }}</Toast.Title>
            <Toast.Description>{{ toast.description }}</Toast.Description>
          </div>
          <Toast.CloseTrigger>
            <XIcon />
          </Toast.CloseTrigger>
        </div>
      </Toast.Root>
    </Toaster>
  </div>
</template>

```

#### Svelte

```svelte
<script lang="ts">
  import { Toast, Toaster, createToaster } from '@ark-ui/svelte/toast'
  import { XIcon, ClockIcon } from 'lucide-svelte'

  const toaster = createToaster({
    overlap: true,
    placement: 'bottom-end',
    gap: 16,
  })

  const durations = [
    { label: '1s', value: 1000 },
    { label: '3s', value: 3000 },
    { label: '5s', value: 5000 },
    { label: '∞', value: Infinity },
  ]
</script>

<div>
  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
    {#each durations as duration}
      <button
        type="button"
        onclick={() =>
          toaster.create({
            title: `Toast (${duration.label})`,
            description: `This toast will ${
              duration.value === Infinity ? 'stay until dismissed' : `disappear in ${duration.label}`
            }.`,
            type: 'info',
            duration: duration.value,
          })}
      >
        {duration.label}
      </button>
    {/each}
  </div>

  <Toaster {toaster}>
    {#snippet children(toast)}
      <Toast.Root>
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <ClockIcon />
          <div style="flex: 1;">
            <Toast.Title>{toast().title}</Toast.Title>
            <Toast.Description>{toast().description}</Toast.Description>
          </div>
          <Toast.CloseTrigger>
            <XIcon />
          </Toast.CloseTrigger>
        </div>
      </Toast.Root>
    {/snippet}
  </Toaster>
</div>

```

### Maximum Visible Toasts

Set the `max` prop on the `createToaster` function to define the maximum number of toasts that can be rendered at any
one time. Any extra toasts will be queued and rendered when a toast has been dismissed.

**Example: max-toasts**

#### React

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/react/toast'
import { XIcon, InfoIcon } from 'lucide-react'

const toaster = createToaster({
  max: 3,
  overlap: true,
  placement: 'bottom-end',
  gap: 16,
})

export const MaxToasts = () => {
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          onClick={() =>
            toaster.create({
              title: `Toast ${Date.now()}`,
              description: 'Maximum of 3 toasts visible at once. Extra toasts are queued.',
              type: 'info',
            })
          }
        >
          Add Toast
        </button>
        <button
          type="button"
          onClick={() => {
            for (let i = 1; i <= 5; i++) {
              toaster.create({
                title: `Toast ${i}`,
                description: `This is toast number ${i}`,
                type: 'info',
              })
            }
          }}
        >
          Add 5 Toasts
        </button>
      </div>

      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root key={toast.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <InfoIcon />
              <div style={{ flex: 1 }}>
                <Toast.Title>{toast.title}</Toast.Title>
                <Toast.Description>{toast.description}</Toast.Description>
              </div>
              <Toast.CloseTrigger>
                <XIcon />
              </Toast.CloseTrigger>
            </div>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Solid

```tsx
import { Toast, Toaster, createToaster } from '@ark-ui/solid/toast'
import { XIcon, InfoIcon } from 'lucide-solid'

export const MaxToasts = () => {
  const toaster = createToaster({
    max: 3,
    overlap: true,
    placement: 'bottom-end',
    gap: 16,
  })

  return (
    <div>
      <div style={{ display: 'flex', 'flex-wrap': 'wrap', gap: '8px' }}>
        <button
          type="button"
          onClick={() =>
            toaster.create({
              title: `Toast ${Date.now()}`,
              description: 'Maximum of 3 toasts visible at once. Extra toasts are queued.',
              type: 'info',
            })
          }
        >
          Add Toast
        </button>
        <button
          type="button"
          onClick={() => {
            for (let i = 1; i <= 5; i++) {
              toaster.create({
                title: `Toast ${i}`,
                description: `This is toast number ${i}`,
                type: 'info',
              })
            }
          }}
        >
          Add 5 Toasts
        </button>
      </div>

      <Toaster toaster={toaster}>
        {(toast) => (
          <Toast.Root>
            <div style={{ display: 'flex', 'align-items': 'flex-start', gap: '12px' }}>
              <InfoIcon />
              <div style={{ flex: 1 }}>
                <Toast.Title>{toast().title}</Toast.Title>
                <Toast.Description>{toast().description}</Toast.Description>
              </div>
              <Toast.CloseTrigger>
                <XIcon />
              </Toast.CloseTrigger>
            </div>
          </Toast.Root>
        )}
      </Toaster>
    </div>
  )
}

```

#### Vue

```vue
<script setup lang="ts">
import { Toast, Toaster, createToaster } from '@ark-ui/vue/toast'
import { XIcon, InfoIcon } from 'lucide-vue-next'

const toaster = createToaster({
  max: 3,
  overlap: true,
  placement: 'bottom-end',
  gap: 16,
})
</script>

<template>
  <div>
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <button
        type="button"
        @click="
          toaster.create({
            title: `Toast ${Date.now()}`,
            description: 'Maximum of 3 toasts visible at once. Extra toasts are queued.',
            type: 'info',
          })
        "
      >
        Add Toast
      </button>
      <button
        type="button"
        @click="
          () => {
            for (let i = 1; i <= 5; i++) {
              toaster.create({
                title: `Toast ${i}`,
                description: `This is toast number ${i}`,
                type: 'info',
              })
            }
          }
        "
      >
        Add 5 Toasts
      </button>
    </div>

    <Toaster :toaster="toaster" v-slot="toast">
      <Toast.Root>
        <div style="display: flex; align-items: flex-start; gap: 12px">
          <InfoIcon />
          <div style="flex: 1">
            <Toast.Title>{{ toast.title }}</Toast.Title>
            <Toast.Description>{{ toast.description }}</Toast.Description>
          </div>
          <Toast.CloseTrigger>
            <XIcon />
          </Toast.CloseTrigger>
        </div>
      </Toast.Root>
    </Toaster>
  </div>
</template>

```

#### Svelte

```svelte
<script lang="ts">
  import { Toast, Toaster, createToaster } from '@ark-ui/svelte/toast'
  import { XIcon, InfoIcon } from 'lucide-svelte'

  const toaster = createToaster({
    max: 3,
    overlap: true,
    placement: 'bottom-end',
    gap: 16,
  })
</script>

<div>
  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
    <button
      type="button"
      onclick={() =>
        toaster.create({
          title: `Toast ${Date.now()}`,
          description: 'Maximum of 3 toasts visible at once. Extra toasts are queued.',
          type: 'info',
        })}
    >
      Add Toast
    </button>
    <button
      type="button"
      onclick={() => {
        for (let i = 1; i <= 5; i++) {
          toaster.create({
            title: `Toast ${i}`,
            description: `This is toast number ${i}`,
            type: 'info',
          })
        }
      }}
    >
      Add 5 Toasts
    </button>
  </div>

  <Toaster {toaster}>
    {#snippet children(toast)}
      <Toast.Root>
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <InfoIcon />
          <div style="flex: 1;">
            <Toast.Title>{toast().title}</Toast.Title>
            <Toast.Description>{toast().description}</Toast.Description>
          </div>
          <Toast.CloseTrigger>
            <XIcon />
          </Toast.CloseTrigger>
        </div>
      </Toast.Root>
    {/snippet}
  </Toaster>
</div>

```

## Guides

### Creating Toast in Effects

When creating a toast inside React effects (like `useEffect`, `useLayoutEffect`, or event handlers that trigger during
render), you may encounter a "flushSync" warning. To avoid this, wrap the toast call in `queueMicrotask`:

```tsx
import { useEffect } from 'react'

export const EffectToast = () => {
  useEffect(() => {
    // ❌ This may cause flushSync warnings
    // toaster.create({ title: 'Effect triggered!' })

    // ✅ Wrap in queueMicrotask to avoid warnings
    queueMicrotask(() => {
      toaster.create({
        title: 'Effect triggered!',
        description: 'This toast was called safely from an effect',
        type: 'success',
      })
    })
  }, [])

  return <div>Component content</div>
}
```

This ensures the toast creation is deferred until after the current execution context, preventing React's concurrent
rendering warnings.

### Styling the toast

There's a minimal styling required for the toast to work correctly.

#### Toast root

The toast root will be assigned these css properties at runtime:

- `--x` - The x position
- `--y` - The y position
- `--scale` - The scale
- `--z-index` - The z-index
- `--height` - The height
- `--opacity` - The opacity
- `--gap` - The gap between toasts

```css
[data-scope='toast'][data-part='root'] {
  translate: var(--x) var(--y);
  scale: var(--scale);
  z-index: var(--z-index);
  height: var(--height);
  opacity: var(--opacity);
  will-change: translate, opacity, scale;
  transition:
    translate 400ms,
    scale 400ms,
    opacity 400ms,
    height 400ms,
    box-shadow 200ms;
  transition-timing-function: cubic-bezier(0.21, 1.02, 0.73, 1);

  &[data-state='closed'] {
    transition:
      translate 400ms,
      scale 400ms,
      opacity 200ms;
    transition-timing-function: cubic-bezier(0.06, 0.71, 0.55, 1);
  }
}
```

#### Styling based on type

You can also style based on the `data-type` attribute.

```css
[data-scope='toast'][data-part='root'] {
  &[data-type='error'] {
    background: red;
    color: white;
  }

  &[data-type='info'] {
    background: blue;
    color: white;
  }

  &[data-type='warning'] {
    background: orange;
  }

  &[data-type='success'] {
    background: green;
    color: white;
  }
}
```

#### Mobile considerations

A very common use case is to adjust the toast width on mobile so it spans the full width of the screen.

```css
@media (max-width: 640px) {
  [data-scope='toast'][data-part='group'] {
    width: 100%;
  }

  [data-scope='toast'][data-part='root'] {
    inset-inline: 0;
    width: calc(100% - var(--gap) * 2);
  }
}
```

## API Reference

### Props

**Component API Reference**

#### React

**Root Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Root Data Attributes:**

| Attribute | Value |
|-----------|-------|
| `[data-scope]` | toast |
| `[data-part]` | root |
| `[data-state]` | "open" | "closed" |
| `[data-type]` | The type of the item |
| `[data-placement]` | The placement of the toast |
| `[data-align]` |  |
| `[data-side]` |  |
| `[data-mounted]` | Present when mounted |
| `[data-paused]` | Present when paused |
| `[data-first]` |  |
| `[data-sibling]` |  |
| `[data-stack]` |  |
| `[data-overlap]` | Present when overlapping |


**ActionTrigger Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**CloseTrigger Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Description Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Title Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Toaster Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `toaster` | `CreateToasterReturn` | Yes |  |
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |
| `dir` | `'ltr' | 'rtl'` | No | The document's text/writing direction. |
| `getRootNode` | `() => Node | ShadowRoot | Document` | No | A root node to correctly resolve document in custom environments. E.x.: Iframes, Electron. |


#### Solid

**Root Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `(props: ParentProps<'div'>) => Element` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Root Data Attributes:**

| Attribute | Value |
|-----------|-------|
| `[data-scope]` | toast |
| `[data-part]` | root |
| `[data-state]` | "open" | "closed" |
| `[data-type]` | The type of the item |
| `[data-placement]` | The placement of the toast |
| `[data-align]` |  |
| `[data-side]` |  |
| `[data-mounted]` | Present when mounted |
| `[data-paused]` | Present when paused |
| `[data-first]` |  |
| `[data-sibling]` |  |
| `[data-stack]` |  |
| `[data-overlap]` | Present when overlapping |


**ActionTrigger Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `(props: ParentProps<'button'>) => Element` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**CloseTrigger Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `(props: ParentProps<'button'>) => Element` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Description Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `(props: ParentProps<'div'>) => Element` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Title Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `(props: ParentProps<'div'>) => Element` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Toaster Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `toaster` | `CreateToasterReturn` | Yes |  |
| `asChild` | `(props: ParentProps<'div'>) => Element` | No | Use the provided child element as the default rendered element, combining their props and behavior. |
| `dir` | `'ltr' | 'rtl'` | No | The document's text/writing direction. |
| `getRootNode` | `() => Node | ShadowRoot | Document` | No | A root node to correctly resolve document in custom environments. E.x.: Iframes, Electron. |


#### Vue

**Root Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Root Data Attributes:**

| Attribute | Value |
|-----------|-------|
| `[data-scope]` | toast |
| `[data-part]` | root |
| `[data-state]` | "open" | "closed" |
| `[data-type]` | The type of the item |
| `[data-placement]` | The placement of the toast |
| `[data-align]` |  |
| `[data-side]` |  |
| `[data-mounted]` | Present when mounted |
| `[data-paused]` | Present when paused |
| `[data-first]` |  |
| `[data-sibling]` |  |
| `[data-stack]` |  |
| `[data-overlap]` | Present when overlapping |


**ActionTrigger Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**CloseTrigger Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Description Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Title Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


**Toaster Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `toaster` | `CreateToasterReturn` | Yes |  |
| `asChild` | `boolean` | No | Use the provided child element as the default rendered element, combining their props and behavior. |


#### Svelte

**Root Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `Snippet<[PropsFn<'div'>]>` | No | Use the provided child element as the default rendered element, combining their props and behavior. |
| `ref` | `Element` | No |  |


**Root Data Attributes:**

| Attribute | Value |
|-----------|-------|
| `[data-scope]` | toast |
| `[data-part]` | root |
| `[data-state]` | "open" | "closed" |
| `[data-type]` | The type of the item |
| `[data-placement]` | The placement of the toast |
| `[data-align]` |  |
| `[data-side]` |  |
| `[data-mounted]` | Present when mounted |
| `[data-paused]` | Present when paused |
| `[data-first]` |  |
| `[data-sibling]` |  |
| `[data-stack]` |  |
| `[data-overlap]` | Present when overlapping |


**ActionTrigger Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `Snippet<[PropsFn<'button'>]>` | No | Use the provided child element as the default rendered element, combining their props and behavior. |
| `ref` | `Element` | No |  |


**CloseTrigger Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `Snippet<[PropsFn<'button'>]>` | No | Use the provided child element as the default rendered element, combining their props and behavior. |
| `ref` | `Element` | No |  |


**Context Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `render` | `Snippet<[UseToastContext]>` | Yes |  |


**Description Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `Snippet<[PropsFn<'div'>]>` | No | Use the provided child element as the default rendered element, combining their props and behavior. |
| `ref` | `Element` | No |  |


**Title Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `asChild` | `Snippet<[PropsFn<'div'>]>` | No | Use the provided child element as the default rendered element, combining their props and behavior. |
| `ref` | `Element` | No |  |


**Toaster Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `toaster` | `CreateToasterReturn` | Yes | The toaster instance. |
| `dir` | `'ltr' | 'rtl'` | No | The document's text/writing direction. |
| `getRootNode` | `() => Node | ShadowRoot | Document` | No | A root node to correctly resolve document in custom environments. E.x.: Iframes, Electron. |
| `ref` | `Element` | No |  |


### Context

These are the properties available when using `Toast.Context`, `useToastContext` hook or `useToast` hook.

**API:**

| Property | Type | Description |
|----------|------|-------------|
| `getCount` | `() => number` | The total number of toasts |
| `getToasts` | `() => ToastProps<any>[]` | The toasts |
| `subscribe` | `(callback: (toasts: Options<O>[]) => void) => VoidFunction` | Subscribe to the toast group |
