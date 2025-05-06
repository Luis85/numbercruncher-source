<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/BasicNode'
import { type BasicNodeInterface } from '@/domains/GraphEditor'
import type { NodeInterface } from 'baklavajs'
import { BASIC_GRAPH_EVENTS } from '@/domains/GraphEditor/constants'
type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

// Props & Emits
const props = defineProps<{
  modelValue: string[]
  node: BasicNode
  intf: NodeInterface<BasicNodeInterface>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'openSidebar'): void
}>()

const state = ref<{ subscribes: string[] }>({ subscribes: [...props.modelValue] })

watch(
  () => state.value,
  (newState) => {
    emit('update:modelValue', [...newState.subscribes])
  },
  { deep: true },
)

onMounted(() => {
  state.value.subscribes = [...props.node.inputs.subscribes.value]
})

// @todo calculate available events in the graph
// Die Options-Liste enthält immer die Defaults + bereits gewählte Events
const options = computed(() => {
  return [...BASIC_GRAPH_EVENTS, ...state.value.subscribes]
})
</script>

<template>
  <p class="mb-0"><strong>Subscribed Events</strong></p>
  <Vueform v-model="state" sync :endpoint="false">
    <TagsElement name="subscribes" :native="false" :create="true" :items="options" />
  </Vueform>
</template>
