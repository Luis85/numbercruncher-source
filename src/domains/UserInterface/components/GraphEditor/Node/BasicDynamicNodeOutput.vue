<script setup lang="ts">
import { type NodeOutput } from '@/domains/GraphEditor'
import type { NodeInterface } from 'baklavajs'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicDynamicNode'

type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

defineProps<{
  modelValue: NodeOutput
  node: BasicNode
  intf: NodeInterface<NodeOutput>
}>()

defineEmits<{
  (e: 'openSidebar'): void
}>()
</script>

<template>
  <section class="head mb-3 text-start">
    <pre>{{ modelValue }}</pre>
  </section>
</template>

<style scoped></style>
