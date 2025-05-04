<script setup lang="ts">
import { computed } from 'vue'
import { BASIC_NODE_ACTIONS } from '@/domains/GraphEditor'

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
const data = computed< { actions: string[] } >({
  get() {
    // Vueform liest data.tags → hier kommen deine aktuellen actions
    return { actions: props.modelValue }
  },
  set(newData) {
    // Vueform schreibt das gesamte Form-Objekt zurück → wir nehmen nur newData.actions
    // und emittieren sofort das Update:
    emit('update:modelValue', [...newData.actions])
  }
})

// Die Options-Liste enthält immer die Defaults + bereits gewählte actions
const options = computed(() => {
  const s = new Set<string>([...BASIC_NODE_ACTIONS, ...data.value.actions])
  return Array.from(s)
})
</script>

<template>
  <p class="mb-0"><strong>Actions</strong></p>
  <Vueform
    v-model="data"
    :endpoint="false"
  >
    <TagsElement
      name="actions"
      :create="true"
      :items="options"
    />
  </Vueform>
</template>

