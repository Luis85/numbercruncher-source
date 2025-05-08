<script setup lang="ts">
import type { Display2dNode } from '@/domains/GraphEditor/nodes/Display/Display2dNode';

const props = defineProps<{
  modelValue: number
  node: Display2dNode
}>()

console.log(props)
</script>

<template>
  <div class ="engine-wrapper">helloo</div>
</template>

<style scoped></style>
