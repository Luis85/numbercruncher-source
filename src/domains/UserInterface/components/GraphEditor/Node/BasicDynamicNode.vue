<script setup lang="ts">
import { type BasicNodeViewModel } from '@/domains/GraphEditor'
import type { NodeInterface } from 'baklavajs'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicDynamicNode'
import { computed, ref } from 'vue'

type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

const props = defineProps<{
  modelValue: BasicNodeViewModel
  node: BasicNode
  intf: NodeInterface<BasicNodeViewModel>
}>()

const emit = defineEmits<{
  (e: 'openSidebar'): void
}>()

const debug = ref(false)

const complexity = computed(() => {
  const metric = props.node.outputs.outputs.value.values.find(
    (item) => item.type === 'NodeStatistics' && item.name === 'complexity',
  )
  return metric ? metric.value : 0
})
</script>

<template>
  <section class="mb-3">
    <button @click="debug = !debug">{{ debug ? 'Hide input' : 'Show input' }}</button>
    <button @click="emit('openSidebar')">Edit node</button>
    <button @click="console.log({ ...modelValue })">Log input state</button>
  </section>

  <section class="mb-3">
    <p class="mb-1"><strong>Id:</strong> {{ modelValue.id }}</p>
    <p class="mb-1"><strong>Type:</strong> {{ modelValue.type }}</p>
    <p class="mb-1"><strong>View:</strong> {{ modelValue.view }}</p>
    <p class="mb-1"><strong>Emits:</strong> {{ modelValue.emits.length }}</p>
    <p class="mb-1"><strong>Subscribes:</strong> {{ modelValue.subscribes.length }}</p>
    <p class="mb-1"><strong>Components:</strong> {{ modelValue.components.length }}</p>
    <p class="mb-1"><strong>Complexity:</strong> {{ complexity }}</p>
    <p class="mb-1" v-if="modelValue.tags.length > 0">
      <strong>Tags: </strong>
      <span v-for="(tag, index) in modelValue.tags" :key="index">{{ tag }}&nbsp;</span>
    </p>
    <p v-else class="mb-0"><strong>Tags: </strong> 0</p>
  </section>

  <section class="mb-3">
    {{ modelValue.description }}
  </section>

  <section v-if="debug" class="mb-3">
    <p class="mb-0 p-0"><strong>Provided Inputs</strong></p>
    <pre>{{ modelValue }}</pre>
  </section>
</template>

<style scoped></style>
