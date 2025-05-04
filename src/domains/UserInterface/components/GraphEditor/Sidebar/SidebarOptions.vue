<script setup lang="ts">
import type { NodeOptionConfiguration } from '@/domains/GraphEditor';
import { ref } from 'vue';

interface MatrixRow {
  type: 'string' | 'number' | 'boolean' | 'list' | null
  name: string | null
  value: string | null
}

interface OptionsData {
  matrix: MatrixRow[]
}

defineProps<{
  modelValue: NodeOptionConfiguration[]
  node?: unknown
  intf?: unknown
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: NodeOptionConfiguration[]): void
}>()

const data = ref<OptionsData>({ matrix: [] })

function processForm() {
  const options: NodeOptionConfiguration[] = []
  for(const option of data.value.matrix) {
    if(!option.type || !option.name) return
    options.push({
      type: option.type,
      name: option.name,
      value: option.value ?? undefined
    })
  }
  emit('update:modelValue', options)
}

</script>

<template>
  <p class="mb-0"><strong>Options</strong></p>
  <Vueform v-model="data" :endpoint="false" @updated="processForm">
    <MatrixElement
      name="matrix"
      :cols="[
        {
          label: 'Type',
          value: 'type',
          inputType: {
            type: 'select',
          },
          items: [
            {
              label: 'Text',
              value: 'string',
            },
            {
              label: 'Number',
              value: 'number',
            },
            {
              label: 'Boolean',
              value: 'boolean',
            },
            {
              label: 'List',
              value: 'list',
            },
          ],
        },
        {
          label: 'Name',
          value: 'name',
          inputType: {
            type: 'text',
          },
        },
        {
          label: 'Value',
          value: 'value',
          inputType: {
            type: 'text',
          },
        },
      ]"
    />
  </Vueform>
</template>

<style>
.numbercruncher .vf-matrix-header {
  justify-content: left;
}
</style>
