<script setup lang="ts">
import { type NodeOutput } from '@/domains/GraphEditor'
import { computed } from 'vue'

const props = defineProps<{
  data: NodeOutput
}>()

// Wir erwarten im value-String: "<width>,<order>"
// z.B. "3,2" → width=3 Spalten, order=2
const layoutComponents = computed(() => {
  return props.data.values
    .filter(item => item.type === 'Component')
    .map(item => {
      const [w, o] = (String(item.value) || '')
        .split(',')
        .map(str => parseInt(str.trim(), 10))
      const width = !isNaN(w) && w > 0 && w <= 6 ? w : 1
      const order = !isNaN(o) ? o : 0
      return { ...item, width, order }
    })
    // sortiere nach order-Wert
    .sort((a, b) => a.order - b.order)
})
</script>

<template>
  <p class="mb-3 p-0"><strong>Calculated Output</strong></p>

  <!-- 6er-Grid mit etwas Abstand -->
  <div class="component-wrapper">
    <section
      v-for="comp in layoutComponents"
      :key="comp.name"
      class="component"
      :style="{ gridColumn: `span ${comp.width}` }"
    >
      <p><strong>{{ comp.name }}</strong></p>
      <p>{{ comp.label }}</p>
      <p>{{ comp.value }}</p>
    </section>
  </div>
</template>

<style scoped>
.component-wrapper {
  font-size: smaller;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: .5rem;
}
.component {
  padding: 1em;
  border: 1px solid rgba(0,0,0,0.7);
}
</style>
