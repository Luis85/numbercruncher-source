<script setup lang="ts">
import { type NodeOutput } from '@/domains/GraphEditor'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from 'vue'

interface Field {
  type: string
  name: string
  default: string
  value: string
}

const props = defineProps<{
  data: NodeOutput
  events: string[]
}>()

const emit = defineEmits<{
  (e: 'doAction', action: string): void
}>()

const container = ref<HTMLElement | null>(null)

onMounted(() => container.value?.addEventListener('click', handleClick))
onBeforeUnmount(() => container.value?.removeEventListener('click', handleClick))

const layoutComponents = computed(() => {
  return props.data.values
    .filter((i) => i.type === 'Component')
    .map((item) => {
      // Parsen der Felder
      let fields: Field[] = []
      try {
        fields = JSON.parse(item.value as string)
      } catch {
        console.warn('Invalid JSON', item.value)
      }

      const get = (n: string): string => {
        const f = fields.find((f) => f.name === n)
        return f?.value ?? ''
      }
      const width = Math.min(Math.max(+get('width') || 1, 1), 6)
      const order = +get('order') || 0
      const description = get('description') ?? ''

      const tpl = get('content') ?? ''
      const DynamicComp = defineComponent({
        props: {
          eventlog: {
            type: Array as PropType<string[]>,
            required: true,
          },
        },
        setup(props) {
          return {
            events: props.eventlog,
          }
        },
        template: `<div>${tpl}</div>`,
      })

      return {
        ...item,
        width,
        order,
        description,
        DynamicComp,
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
</script>

<template>
  <p class="mb-3 p-0"><strong>Layout preview</strong></p>
  <div ref="container" class="component-wrapper">
    <section
      v-for="comp in layoutComponents"
      :key="comp.name"
      class="component"
      :style="{ gridColumn: `span ${comp.width}` }"
    >
      <h4>{{ comp.label }}</h4>
      <p>{{ comp.description }}</p>
      <component :is="comp.DynamicComp" :eventlog="events" />
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
