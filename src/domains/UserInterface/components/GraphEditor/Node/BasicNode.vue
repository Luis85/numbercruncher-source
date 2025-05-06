<script setup lang="ts">
import { type BasicNodeInterface } from '@/domains/GraphEditor'
import type { NodeInterface } from 'baklavajs'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/Basics/BasicNode'
import { computed, ref } from 'vue'

type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

const props = defineProps<{
  modelValue: BasicNodeInterface
  node: BasicNode
  intf: NodeInterface<BasicNodeInterface>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: BasicNodeInterface): void
  (e: 'openSidebar'): void
}>()

const debug = ref(false)

const complexity = computed(() => {
  const metric = props.node.outputs.outputs.value.values.find(
    (item) => item.type === 'NodeStatistics' && item.name === 'complexity',
  )
  return metric ? metric.value : 0
})
</script>

<template>
  <section class="head mb-3">
    <p class="mb-2"><strong>Type:</strong> {{ modelValue.type }}</p>
    <p class="mb-2"><strong>View:</strong> {{ modelValue.view }}</p>
    <p class="mb-2"><strong>Emits:</strong> {{ modelValue.emits.length }}</p>
    <p class="mb-2"><strong>Subscribes:</strong> {{ modelValue.subscribes.length }}</p>
    <p class="mb-2"><strong>Complexity:</strong> {{ complexity }}</p>
    <p class="mb-0" v-if="modelValue.tags.length > 0">
      <strong>Tags: </strong>
      <span v-for="(tag, index) in modelValue.tags" :key="index">{{ tag }}&nbsp;</span>
    </p>
    <p v-else class="mb-0"><strong>Tags: </strong> 0</p>
  </section>

  <section>
    <button @click="emit('openSidebar')">Edit</button>
    <button @click="debug = !debug">Debug {{ debug }}</button>
    <button v-if="debug" @click="console.log({ ...modelValue })">Log State</button>
    <pre v-if="debug" class="py-4">{{ modelValue }}</pre>
  </section>
</template>

<style>
#app-main .baklava-node {
  border: 1px solid rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 5px 0px rgba(0, 0, 0, 0.2);
}

#app-main .baklava-node > .__title {
  border-bottom: 1px solid rgba(0, 0, 0, 0.85);
}

#app-main .baklava-select > .__selected,
#app-main .baklava-num-input,
#app-main .baklava-checkbox .__checkmark-container,
#app-main .baklava-input {
  border: 1px solid rgba(0, 0, 0, 0.65);
  box-shadow: inset 1px 1px 3px 0px rgba(0, 0, 0, 0.5);
}

#app-main .baklava-node.--selected,
#app-main .baklava-node:hover {
  border-color: rgba(0, 0, 0, 0.401);
}

#app-main .baklava-slider > .__slider {
  background-color: hsla(160, 100%, 37%, 1);
}

#app-main .baklava-node.--two-column > .__content {
  column-gap: 25px;
}

.baklava-node.ActorNode {
  background-color: rgba(52, 140, 217, 0.6);
}

.baklava-node.TestNode {
  background-color: rgba(10, 137, 17, 0.4);
}
.baklava-node.ComponentNode {
  background-color: rgba(247, 234, 89, 0.4);
}

.baklava-node.SceneNode {
  background-color: rgba(70, 18, 116, 0.4);
}

.baklava-node.EventNode {
  background-color: rgba(0, 204, 255, 0.6);
}

.baklava-node.StockNode,
.baklava-node.EngineNode,
.baklava-node.SystemNode {
  background-color: rgba(255, 166, 0, 0.4);
}

#app-main .baklava-node-interface .__port {
  width: 15px;
  border-radius: 3px;
  border: 1px solid #000000cb;
  background: #d5d5d5;
}

#app-main .is-running .baklava-node-interface.--connected .__port {
  background: #399839;
}

#app-main .is-running .baklava-node-interface .__port {
  background: #8a3232;
}
</style>

<style scoped></style>
