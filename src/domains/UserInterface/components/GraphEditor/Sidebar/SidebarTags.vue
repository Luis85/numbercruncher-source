<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicNode'
import { type BasicNodeViewModel } from '@/domains/GraphEditor'
import type { NodeInterface } from 'baklavajs'
import { BASIC_NODE_TAGS } from '@/domains/GraphEditor/constants/BasicNodeTags'
type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

// Props & Emits
const props = defineProps<{
  modelValue: string[]
  node: BasicNode
  intf: NodeInterface<BasicNodeViewModel>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'openSidebar'): void
}>()

const state = ref<{ tags: string[] }>({ tags: [...props.modelValue] })

watch(
  () => state.value,
  (newState) => {
    emit('update:modelValue', [...newState.tags])
  },
  { deep: true },
)

onMounted(() => {
  state.value.tags = [...props.node.inputs.tags.value]
})

// Die Options-Liste enthält immer die Defaults + bereits gewählte Tags
const options = computed(() => {
  return [...BASIC_NODE_TAGS, ...state.value.tags]
})
</script>

<template>
  <p class="mb-0"><strong>Tags</strong></p>
  <Vueform v-model="state" sync :endpoint="false">
    <TagsElement name="tags" :native="false" :create="true" :items="options" />
  </Vueform>
</template>
