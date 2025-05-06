<script setup lang="ts">
import {
  type BasicNodeInterface,
  type NodeOutput,
  type NodeStatistics,
} from '@/domains/GraphEditor'
import type { NodeInterface } from 'baklavajs'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/BasicNode'
import { ref, watch } from 'vue'

type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

const props = defineProps<{
  modelValue: BasicNodeInterface
  node: BasicNode
  intf: NodeInterface<BasicNodeInterface>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: BasicNodeInterface): void
  (e: 'openSidebar'): void
}>()

const state = ref<BasicNodeInterface>({ ...props.modelValue })

function processInputs(newInputs: NodeOutput[]) {
  if (!state.value.id) return

  const size = newInputs.length + 1 + (state.value.parent ? 1 : 0)
  let complexity = 0
  for (const node of newInputs) {
    if (!node) continue
    const metric = node.values.find(
      (item) => item.type === 'NodeStatistics' && item.name === 'complexity',
    )
    if (!metric) continue
    complexity += Number(metric.value)
  }

  state.value.outputs = {
    id: state.value.id,
    type: state.value.type,
    values: [
      {
        type: 'NodeStatistics',
        name: 'inputCount',
        value: newInputs.length,
      },
      {
        type: 'NodeStatistics',
        name: 'size',
        value: size,
      },
      {
        type: 'NodeStatistics',
        name: 'complexity',
        value: complexity,
      },
    ] as NodeStatistics[],
  }

  emit('update:modelValue', { ...state.value })
}

watch(
  () => props.modelValue,
  (newState) => {
    state.value = { ...newState }
  },
  { deep: true },
)

watch(
  () => props.modelValue.inputs,
  (newInputs) => processInputs(newInputs),
)
</script>

<template>
  <h4>Node State</h4>
  <button @click="emit('openSidebar')">Edit</button>
  <button @click="console.log({ ...state })">Log State</button>
  <pre>{{ state }}</pre>
</template>
