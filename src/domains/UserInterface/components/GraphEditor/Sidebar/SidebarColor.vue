<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue?: string
  node?: unknown
  intf?: unknown
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// Fallback, falls modelValue undefined ist
const defaultColor = '#000000'

// Eine einfache Computed-Property für den Farbwert
const color = computed<string>({
  get: () => props.modelValue ?? defaultColor,
  set: v => {
    // Hier emittieren wir nur den String
    emit('update:modelValue', v)
  }
})
</script>

<template>
  <p class="mb-0"><strong>Color</strong></p>
  <input type="color" v-model="color" name="color"  class="form-control form-control-color form-control-sm"/>
</template>

<style scoped>

</style>
