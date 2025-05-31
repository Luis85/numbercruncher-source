<script setup lang="ts">
import { type NodeOutput } from '@/domains/GraphEditor'
import type { NodeInterface } from 'baklavajs'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicDynamicNode'
import { computed, defineAsyncComponent, ref } from 'vue'

type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

const props = defineProps<{
  modelValue: NodeOutput
  node: BasicNode
  intf: NodeInterface<NodeOutput>
}>()

defineEmits<{
  (e: 'openSidebar'): void
}>()

const debug = ref(false)
const events = ref<string[]>([])
const type = computed(() => props.modelValue.type)

const componentMap: Record<string, unknown> = {
  ViewNode: defineAsyncComponent(() => import('./ViewNodeOutput.vue')),
}
const DynamicComponent = computed(() => {
  return componentMap[type.value] || null
})

function handleAction(action: string) {
  console.log('handle action: ' + action)
  events.value.push('user clicked on ' + action)
}

function resetEvents() {
  events.value = []
}
</script>

<template>
  <section class="mb-3 text-start">
    <button @click="resetEvents" :disabled="events.length < 1">↩️</button>
    <button @click="debug = !debug">{{ debug ? 'Hide output' : 'Show output' }}</button>
    <button @click="console.log(modelValue)">Log output</button>
  </section>

  <section v-if="DynamicComponent" class="mb-3 text-start">
    <component
      :is="DynamicComponent"
      :data="modelValue"
      :events="events"
      @doAction="handleAction"
    />
  </section>

  <section v-if="debug" class="mb-3 text-start">
    <p class="mb-0 p-0"><strong>Debug</strong></p>
    <pre>{{ modelValue }}</pre>
  </section>
</template>

<style scoped></style>
