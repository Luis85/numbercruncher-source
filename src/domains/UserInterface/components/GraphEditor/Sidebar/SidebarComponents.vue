<script setup lang="ts">
import { computed } from 'vue'
import { BASIC_NODE_COMPONENTS } from '@/domains/GraphEditor'

// Props & Emits
const props = defineProps<{
  modelValue: string[]
  node?: unknown
  intf?: unknown
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

// Computed-Proxy für das ganze Form-Objekt
const data = computed< { components: string[] } >({
  get() {
    // Vueform liest data.tags → hier kommen deine aktuellen Components
    return { components: props.modelValue }
  },
  set(newData) {
    // Vueform schreibt das gesamte Form-Objekt zurück → wir nehmen nur newData.components
    // und emittieren sofort das Update:
    emit('update:modelValue', [...newData.components])
  }
})

// Die Options-Liste enthält immer die Defaults + bereits gewählte Components
const options = computed(() => {
  const s = new Set<string>([...BASIC_NODE_COMPONENTS, ...data.value.components])
  return Array.from(s)
})
</script>

<template>
  <p class="mb-0"><strong>Components</strong></p>
  <Vueform
    v-model="data"
    :endpoint="false"
  >
    <TagsElement
      name="components"
      :create="true"
      :items="options"
    />
  </Vueform>
</template>

