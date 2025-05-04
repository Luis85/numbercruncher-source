<script setup lang="ts">
import { computed } from 'vue'
import { BASIC_NODE_TAGS } from '@/domains/GraphEditor'

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
const data = computed< { tags: string[] } >({
  get() {
    // Vueform liest data.tags → hier kommen deine aktuellen Tags
    return { tags: props.modelValue }
  },
  set(newData) {
    // Vueform schreibt das gesamte Form-Objekt zurück → wir nehmen nur newData.tags
    // und emittieren sofort das Update:
    emit('update:modelValue', [...newData.tags])
  }
})

// Die Options-Liste enthält immer die Defaults + bereits gewählte Tags
const options = computed(() => {
  const s = new Set<string>([...BASIC_NODE_TAGS, ...data.value.tags])
  return Array.from(s)
})
</script>

<template>
  <p class="mb-0"><strong>Tags</strong></p>
  <Vueform
    v-model="data"
    :endpoint="false"
  >
    <TagsElement
      name="tags"
      :create="true"
      :items="options"
    />
  </Vueform>
</template>

