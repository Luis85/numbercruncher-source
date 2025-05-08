<script setup lang="ts">
import { type BasicNodeViewModel } from '@/domains/GraphEditor'
import type { NodeInterface } from 'baklavajs'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicNode'
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
  <hr />
  <section class="head mb-3">
    <p class="mb-2"><strong>Id:</strong> {{ modelValue.id }}</p>
    <p class="mb-2"><strong>Type:</strong> {{ modelValue.type }}</p>
    <p class="mb-2"><strong>View:</strong> {{ modelValue.view }}</p>
    <p class="mb-2"><strong>Emits:</strong> {{ modelValue.emits.length }}</p>
    <p class="mb-2"><strong>Subscribes:</strong> {{ modelValue.subscribes.length }}</p>
    <p class="mb-2"><strong>Components:</strong> {{ modelValue.components.length }}</p>
    <p class="mb-2"><strong>Complexity:</strong> {{ complexity }}</p>
    <p class="mb-0" v-if="modelValue.tags.length > 0">
      <strong>Tags: </strong>
      <span v-for="(tag, index) in modelValue.tags" :key="index">{{ tag }}&nbsp;</span>
    </p>
    <p v-else class="mb-0"><strong>Tags: </strong> 0</p>
  </section>

  <section class="head mb-3">
    {{ modelValue.description }}
  </section>

  <hr />
  <section>
    <button @click="emit('openSidebar')">Edit</button>
    <button @click="debug = !debug">Debug {{ debug }}</button>
    <button v-if="debug" @click="console.log({ ...modelValue })">Log State</button>
    <pre v-if="debug" class="py-4">{{ modelValue }}</pre>
  </section>
</template>

<style scoped></style>
