<script setup lang="ts">
import type { Display2dRendererState } from '@/domains/GraphEditor/nodes/Display'
import type { Display2dNode } from '@/domains/GraphEditor/nodes/Display/Display2dNode'
import { Actor, Color, Engine, PointerScope } from 'excalibur'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  modelValue: Display2dRendererState
  node: Display2dNode
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const state = ref<Display2dRendererState>({ step: 0, data: [] })
const engine = ref<Engine>()

/**
 * @todo: wrap excalibur engine in own engine class and create scenes and stuff from there
 */
function buildEngine() {
  if (!canvas.value) return
  if (!engine.value) {
    engine.value = new Engine({
      canvasElement: canvas.value,
      width: 800,
      height: 600,
      suppressConsoleBootMessage: true,
      pointerScope: PointerScope.Canvas,
      backgroundColor: Color.fromHex('#00000099'),
    })
    engine.value.debug.entity.showName = true
    engine.value.debug.entity.showAll = true

    engine.value.toggleDebug()

    const player = new Actor()
    const enemy = new Actor()
    engine.value.add(player)
    engine.value.add(enemy)

    player.actions.repeatForever((ctx) => {
      ctx
        .moveTo(500, 150, 1200)
        .delay(1000)
        .moveTo(100, 300, 1500)
        .delay(1000)
        .moveTo(200, 500, 1500)
        .delay(800)
    })
  }
}

function startEngine() {
  if (!engine.value) return
  engine.value.start().then(function () {
    console.log('engine started')
  })
}

function changeScene(name: string) {
  if (!engine.value) return
  engine.value.goToScene(name).then(() => {
    console.log('switched to scene: ' + name)
  })
}

function toggleDebug() {
  console.log(state.value)
  if (!engine.value) return
  engine.value.toggleDebug()
}

/**
 * this looks unnecesary for now,
 * but separate state would be needed for further mapping of used entities and building the engine scene accordingly
 */
watch(
  () => props.modelValue,
  (newState) => {
    state.value = newState
  },
  { deep: true },
)

onMounted(() => {
  buildEngine()
})

onBeforeUnmount(() => {
  if (!engine.value) return
  engine.value.stop()
  engine.value.dispose()
})
</script>

<template>
  <div id="root">
    <p>Step: {{ state.step }}</p>
    <p>Data Size: {{ state.data.length }}</p>
    <p>FPS: {{ engine && engine.isRunning() ? engine.debug.stats.currFrame.fps.toFixed(0) : 0 }}</p>

    <div v-if="engine" id="ui">
      <p v-if="!engine.isRunning()"><button @click="startEngine">Start</button></p>
      <p v-if="engine.isRunning()"><button @click="engine.stop">Stop</button><button @click="toggleDebug()">Debug ({{ engine.isDebug }})</button></p>
      <p>Scenes</p>
      <ul>
        <li>
          <button @click="changeScene('root')">
            <span v-if="engine.currentSceneName === 'root'">✅</span>root
          </button>
        </li>
      </ul>
    </div>

    <canvas ref="canvas" class="excalibur-canvas"></canvas>
  </div>
</template>

<style scoped>
#root {
  position: relative;
}

#root #ui {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  text-align: left;
}

.excalibur-canvas {
  width: 100%;
  height: 600px;
  border: 1px solid #00000099;
  display: block;
}
</style>
