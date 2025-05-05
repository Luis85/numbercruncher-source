<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NodeOptionConfiguration } from '@/domains/GraphEditor'

// Props & Emits
const props = defineProps<{
  modelValue: NodeOptionConfiguration[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: NodeOptionConfiguration[]): void
}>()

const options = ref<NodeOptionConfiguration[]>([...props.modelValue])

// When parent changes (e.g. on load), sync in
watch(
  () => options.value,
  val => {
    emit('update:modelValue', [...val])
  },
  { deep: true }
)

// Methods to add/remove
function add() {
  options.value.push({ type: '', name: '', value: '' })
}

function remove(index: number) {
  options.value.splice(index, 1)
}
</script>

<template>
  <div class="sidebar-options">
    <p><strong>Options</strong></p>>
    <ul class="options-list">
      <li v-for="(opt, idx) in options" :key="idx" class="option-row">
        <select v-model="opt.type" class="opt-type">
          <option disabled value="">-- type --</option>
          <option value="string">Text</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="list">List</option>
        </select>
        <input
          v-model="opt.name"
          class="opt-name"
          type="text"
          placeholder="Name"
        />
        <input
          v-model="opt.value"
          class="opt-value"
          type="text"
          placeholder="Value"
        />
        <button @click="remove(idx)" class="btn-remove">✕</button>
      </li>
    </ul>
    <button @click="add()" class="btn-add">+ Add Option</button>
  </div>
</template>

<style scoped>

.options-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}
.opt-name {
  flex: 1;
}
.opt-value {
  flex: 1;
}
.btn-remove {
  background: transparent;
  border: none;
  color: #c00;
  cursor: pointer;
  font-size: 1.1rem;
}
.btn-remove:hover {
  color: #f00;
}
.btn-add {
  cursor: pointer;
}
</style>
