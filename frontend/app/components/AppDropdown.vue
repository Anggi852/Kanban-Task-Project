<script setup lang="ts">
import { ref } from 'vue'
import { onClickOutside } from '@vueuse/core'

withDefaults(
  defineProps<{
    align?: 'left' | 'right'
    width?: string
  }>(),
  {
    align: 'right',
    width: 'w-56',
  },
)

const open = ref(false)
const root = ref<HTMLElement | null>(null)

onClickOutside(root, () => {
  open.value = false
})

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

defineExpose({ close, toggle })
</script>

<template>
  <div ref="root" class="relative inline-block">
    <slot name="trigger" :toggle="toggle" :open="open" />

    <Transition
      enter-active-class="transition duration-150 ease-out"
      leave-active-class="transition duration-100 ease-in"
      enter-from-class="opacity-0 translate-y-1"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="open"
        :class="[
          'absolute z-30 mt-2 origin-top rounded-card border border-border bg-surface shadow-card overflow-hidden',
          'dark:bg-surface-dark dark:border-border-dark',
          align === 'right' ? 'right-0' : 'left-0',
          width,
        ]"
        role="menu"
        @click="close"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>