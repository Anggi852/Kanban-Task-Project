<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    closeOnBackdrop?: boolean
  }>(),
  {
    size: 'md',
    closeOnBackdrop: true,
  },
)

const emit = defineEmits<{ close: [] }>()

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  (val) => {
    if (!import.meta.client) return
    if (val) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', onKey)
    } else {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (!import.meta.client) return
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
      >
        <div
          class="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
          @click="closeOnBackdrop && emit('close')"
        />
        <Transition
          enter-active-class="transition duration-200 ease-out"
          leave-active-class="transition duration-150 ease-in"
          enter-from-class="opacity-0 translate-y-2 scale-[0.98]"
          leave-to-class="opacity-0 translate-y-2 scale-[0.98]"
          appear
        >
          <div
            v-if="open"
            :class="[
              'relative w-full bg-surface text-ink rounded-modal shadow-xl border border-border',
              'dark:bg-surface-dark dark:text-ink-dark dark:border-border-dark',
              sizes[size],
            ]"
          >
            <header
              v-if="title || $slots.header"
              class="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border dark:border-border-dark"
            >
              <div>
                <h2 v-if="title" id="modal-title" class="text-base font-semibold">
                  {{ title }}
                </h2>
                <p v-if="description" class="mt-1 text-sm text-ink-muted">
                  {{ description }}
                </p>
                <slot name="header" />
              </div>
              <button
                type="button"
                class="-mr-2 -mt-1 p-2 rounded-button text-ink-muted hover:text-ink hover:bg-canvas dark:hover:bg-canvas-dark dark:hover:text-ink-dark transition-colors"
                aria-label="Close"
                @click="emit('close')"
              >
                <X class="h-4 w-4" />
              </button>
            </header>

            <div class="px-6 py-5">
              <slot />
            </div>

            <footer
              v-if="$slots.footer"
              class="flex items-center justify-end gap-2 px-6 py-4 border-t border-border dark:border-border-dark"
            >
              <slot name="footer" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>