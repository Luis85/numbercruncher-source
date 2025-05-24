<script setup lang="ts">
import { type NodeOutput } from '@/domains/GraphEditor'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface Field {
  type: string
  name: string
  default: string
  value: string
}

const props = defineProps<{
  data: NodeOutput
}>()

const emit = defineEmits<{
  (e: 'doAction', action: string): void
}>()

const container = ref<HTMLElement|null>(null)

const layoutComponents = computed(() => {
  return props.data.values
    .filter((item) => item.type === 'Component')
    .map((item) => {
      let fields: Field[] = []
      try {
        fields = item.value ? (JSON.parse(item.value as string) as Field[]) : []
      } catch (e) {
        console.warn('Fehler beim Parsen von value JSON:', e)
      }

      const getField = (n: string) => fields.find((f) => f.name === n)?.value

      // Default auf 1 Spalte und order 0, falls nicht gesetzt
      const width = parseInt(getField('width') ?? '', 10) || 1
      const order = parseInt(getField('order') ?? '', 10) || 0
      const description = getField('description') ?? ''
      const content = getField('content') ?? ''

      return {
        ...item,
        width,
        order,
        description,
        content,
      }
    })
    .sort((a, b) => a.order - b.order)
})

function handleClick(e: MouseEvent) {
  const t = e.target as HTMLElement
  if (t.tagName === 'BUTTON') {
    // Hier kannst du über data-Attribute oder den Button text wissen,
    // welche Action ausgeführt werden soll.
    // Beispiel: <button data-action="foo">…
    const action = t.getAttribute('data-action') || t.innerText
    console.log('Button clicked:', action)
    emit('doAction', action)
  }
}

onMounted(() => {
  if (container.value) container.value.addEventListener('click', handleClick)
})
onBeforeUnmount(() => {
  if (container.value) container.value.removeEventListener('click', handleClick)
})

</script>

<template>
  <p class="mb-3 p-0"><strong>Calculated Output</strong></p>
  <div ref="container" class="component-wrapper">
    <section
      v-for="comp in layoutComponents"
      :key="comp.name"
      class="component"
      :style="{ gridColumn: `span ${comp.width}` }"
    >
      <h4>{{ comp.label }}</h4>
      <p>{{ comp.description }}</p>
      <div v-html="comp.content"></div>
    </section>
  </div>
</template>

<style scoped>
.component-wrapper {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  padding: 1em;
  border: 1px solid rgba(0, 0, 0, 0.7);
}
.component {
  padding: 1em;
  border: 1px solid rgba(0, 0, 0, 0.7);
  background: rgba(255, 255, 255, 0.1);
}

h4 {
  font-size: 16px;
}
</style>
