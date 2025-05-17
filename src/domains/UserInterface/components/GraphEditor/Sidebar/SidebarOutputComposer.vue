<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicDynamicNode'
import type { NodeInterface } from 'baklavajs'
import type { SidebarOption } from '@/domains/GraphEditor'
type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

// Props & Emits
const props = defineProps<{
  modelValue: SidebarOption[]
  node: BasicNode
  intf: NodeInterface<SidebarOption[]>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: SidebarOption[]): void
}>()

const state = ref<{ exports: string[] }>({ exports: [] })

watch(
  () => state.value,
  (modelState) => {
    const exports: string[] = modelState.exports
    const nodeInputs = props.node.inputs.view.value.inputs
    if (!nodeInputs) return

    const newState: SidebarOption[] = []
    for (const nodeId of exports) {
      const nodeInput = nodeInputs.find((item) => item.id === nodeId)
      if (!nodeInput) continue
      newState.push({
        type: nodeInput.type,
        name: nodeInput.name,
        label: nodeInput.type + ' ' + nodeInput.name,
        value: nodeInput.id,
        disabled: false,
      })
    }
    emit('update:modelValue', newState)
  },
  { deep: true },
)

const options = computed(() => {
  const nodeInputs: SidebarOption[] = props.node.inputs.view.value.inputs.map((item) => {
    return {
      type: item.type,
      name: item.name,
      label: item.type + ' ' + item.name,
      value: item.id,
      disabled: false,
    }
  })
  return nodeInputs
})

onMounted(() => {
  state.value.exports = props.intf.value.map((item) => {
    return String(item.value)
  })
})
</script>

<template>
  <p class="mb-0">
    <strong>{{ intf.name }}</strong>
  </p>
  <Vueform v-model="state" sync :endpoint="false">
    <TagsElement name="exports" :native="false" :create="false" :items="options" />
  </Vueform>
</template>
