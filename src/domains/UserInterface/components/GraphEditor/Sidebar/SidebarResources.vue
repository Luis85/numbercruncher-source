<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/BasicNode'
import { type BasicNodeInterface } from '@/domains/GraphEditor'
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

const state = ref<{ resources: string[] }>({ resources: [...props.modelValue] })

watch(
  () => state.value,
  (newState) => {
    emit('update:modelValue', [...newState.resources])
  },
  { deep: true },
)

onMounted(() => {
  state.value.resources = [...props.node.inputs.resources.value]
})

const options = computed(() => {
  return [...state.value.resources]
})
</script>

<template>
  <p class="mb-0"><strong>Resources</strong></p>
  <Vueform v-model="state" sync :endpoint="false">
    <TagsElement name="resources" :native="false" :create="true" :items="options" />
  </Vueform>
</template>
