<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { type BasicNodeViewModel } from '@/domains/GraphEditor'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicNode'
import type { NodeInterface } from 'baklavajs'
import { BASIC_NODE_ACTIONS } from '@/domains/GraphEditor/constants/BasicNodeActions'
type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

// Props & Emits
const props = defineProps<{
  modelValue: string[]
  node: BasicNode
  intf: NodeInterface<BasicNodeViewModel>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const state = ref<{ actions: string[] }>({ actions: [...props.modelValue] })

watch(
  () => state.value,
  (newState) => {
    emit('update:modelValue', [...newState.actions])
  },
  { deep: true },
)

onMounted(() => {
  state.value.actions = [...props.node.inputs.actions.value]
})

// Die Options-Liste enthält immer die Defaults + bereits gewählte actions
const options = computed(() => {
  return [...BASIC_NODE_ACTIONS, ...state.value.actions]
})
</script>

<template>
  <p class="mb-0"><strong>Actions</strong></p>
  <Vueform v-model="state" sync v:endpoint="false">
    <TagsElement name="actions" :create="true" :items="options" />
  </Vueform>
</template>
