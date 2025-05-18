<script setup lang="ts">
import { type NodeOutput } from '@/domains/GraphEditor'
import type { NodeInterface } from 'baklavajs'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicDynamicNode'
import { ref } from 'vue'

type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

defineProps<{
  modelValue: NodeOutput
  node: BasicNode
  intf: NodeInterface<NodeOutput>
}>()

defineEmits<{
  (e: 'openSidebar'): void
}>()

const debug = ref(false)
</script>

<template>
  <section class="mb-3 text-start">
    <button @click="debug = !debug">{{ debug ? 'Hide output' : 'Show output' }}</button>
  </section>

  <section v-if="debug" class="mb-3 text-start">
    <p class="mb-0 p-0"><strong>Calculated Output</strong></p>
    <pre>{{ modelValue }}</pre>
  </section>
</template>

<style scoped></style>
