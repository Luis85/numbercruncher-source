<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/BasicNode'
import { BASIC_NODE_EVENTS, type BasicNodeInterface } from '@/domains/GraphEditor'
import type { NodeInterface } from 'baklavajs'
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

const state = ref<{ emits: string[] }>({ emits: [...props.modelValue] })

watch(
  () => state.value,
  (newState) => {
    emit('update:modelValue', [...newState.emits])
  },
  { deep: true },
)

onMounted(() => {
  state.value.emits = [...props.node.inputs.emits.value]
})

// Die Options-Liste enthält immer die Defaults + bereits gewählte Events
const options = computed(() => {
  return [...BASIC_NODE_EVENTS, ...state.value.emits]
})
</script>

<template>
  <p class="mb-0"><strong>Emitted Events</strong></p>
  <Vueform v-model="state" sync :endpoint="false">
    <TagsElement name="emits" :native="false" :create="true" :items="options" />
  </Vueform>
</template>
