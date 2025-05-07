<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicNode'
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

const state = ref<{ exports: string[] }>({ exports: props.modelValue })

watch(
  () => state.value,
  (newState) => {
    emit('update:modelValue', newState.exports)
  },
  { deep: true },
)

onMounted(() => {
  state.value.exports = props.node.inputs.exports.value
})

// Die Options-Liste enthält immer die Defaults + bereits gewählte exports
const options = computed(() => {
  // 1) Alle NodeInput-Werte einsammeln
  const nodeInputs = props.node.inputs.view.value.inputs

  // 2) Nur die type-Strings extrahieren
  const types = nodeInputs.map((input) => input.type)

  // 3) Duplikate entfernen
  //const uniqueTypes = Array.from(new Set(types))

  return [...state.value.exports, ...types]
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
