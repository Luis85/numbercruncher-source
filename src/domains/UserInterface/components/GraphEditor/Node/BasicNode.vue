<script setup lang="ts">
import { type BasicNodeInterface, type NodeInput } from '@/domains/GraphEditor';
import type { NodeInterface } from 'baklavajs';
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/BasicNode'
import { ref, watch } from 'vue';

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

function processInputs(newInputs: NodeInput[]) {
  if(!state.value.id) return
  state.value.outputs =
    {
      id: state.value.id,
      type: state.value.type,
      values: [
        {
          name: 'inputCount',
          value: newInputs.length
        },
        {
          name: 'size',
          value: newInputs.length + 1
        },
      ]
  }

  emit('update:modelValue', {...state.value})
}

watch(
  () => props.modelValue,
  (newState) => {
    state.value = { ...newState }
  },
  {deep: true}
)

watch(
  () => props.modelValue.inputs,
  (newInputs) => processInputs(newInputs),
)
</script>

<template>
  <h4>Node State <button @click="emit('openSidebar')">Edit</button></h4>
  <pre>{{ state }}</pre>

</template>
