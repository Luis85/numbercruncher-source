<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { type BasicNodeViewModel } from '@/domains/GraphEditor'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicNode'
import type { NodeInterface } from 'baklavajs'
import { BASIC_NODE_COMPONENTS } from '@/domains/GraphEditor/constants'
type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

// Props & Emits

/**
 * @TODO: this is not the right way to do it. props.intf is the concrete nodeInterface, it does not have the full NodeViewModel
 * The whole Sidebar needs a rework as it gets way too much data and also not the correctly typed data
 */
const props = defineProps<{
  modelValue: string[]
  node: BasicNode
  intf: NodeInterface<BasicNodeViewModel>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const state = ref<{ components: string[] }>({ components: [...props.modelValue] })

watch(
  () => state.value,
  (newState) => {
    emit('update:modelValue', [...newState.components])
  },
  { deep: true },
)

onMounted(() => {
  state.value.components = [...props.node.inputs.components.value]
})

// Die Options-Liste enthält immer die Defaults + bereits gewählte Components
const options = computed(() => {
  return [...BASIC_NODE_COMPONENTS, ...state.value.components]
})
</script>

<template>
  <p class="mb-0"><strong>Components</strong></p>
  <Vueform v-model="state" sync :endpoint="false">
    <TagsElement name="components" :create="true" :items="options" />
  </Vueform>
</template>
