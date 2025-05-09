<script setup lang="ts">
import type {
  Display2dRendererActorConfig,
  Display2dRendererState,
} from '@/domains/GraphEditor/nodes/Display'
import type { Display2dNode } from '@/domains/GraphEditor/nodes/Display/Display2dNode'
import { DISPLAY2D_EMPTY_STATE } from '@/domains/GraphEditor/constants/Display2dEmptyState'
import { Actor, Color, Engine, PointerScope, Scene, type ActorArgs } from 'excalibur'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { NodeInterface, useGraph } from 'baklavajs'
import type { BasicNodeOutputPorts, NodeOutput } from '@/domains/GraphEditor'
const props = defineProps<{
  modelValue: Display2dRendererState
  node: Display2dNode
}>()

const { graph } = useGraph()
const canvas = ref<HTMLCanvasElement | null>(null)
const state = ref<Display2dRendererState>({ ...DISPLAY2D_EMPTY_STATE })
const engine = ref<Engine>()

const sceneMap = new Map<string, Scene>()
const actorMap = new Map<string, Actor>()

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

    addScene('iteration target')

    engine.value.debug.entity.showName = true
    engine.value.debug.entity.showAll = true

    engine.value.toggleDebug()
  }
}

function addScene(name: string) {
  if (!engine.value) return
  const scene = new Scene()
  engine.value.addScene(name, addActors(scene))
}

function addActors(scene: Scene): Scene {
  const playerActor: ActorArgs = {
    name: 'Player Actor',
    width: 25,
    height: 25,
    color: Color.ExcaliburBlue,
  }

  const enemyActor: ActorArgs = {
    name: 'Enemy Actor',
    width: 25,
    height: 25,
    color: Color.Red,
  }

  const player = new Actor(playerActor)
  const enemy = new Actor(enemyActor)

  scene.add(player)
  scene.add(enemy)

  player.actions.repeatForever((ctx) => {
    ctx
      .moveTo(500, 150, 1200)
      .delay(1000)
      .moveTo(100, 300, 1500)
      .delay(1000)
      .moveTo(200, 500, 1500)
      .delay(800)
  })

  enemy.actions.repeatForever((ctx) => {
    ctx
      .moveTo(100, 350, 600)
      .delay(1000)
      .moveTo(200, 100, 200)
      .delay(1000)
      .moveTo(340, 500, 1100)
      .delay(800)
  })

  return scene
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

onMounted(() => {
  buildEngine()
})

onBeforeUnmount(() => {
  if (!engine.value) return
  engine.value.stop()
  engine.value.dispose()
})

// generated gamestate for excalibur out of the provided config from baklava
// remember: in order to save baklava state the nodes needs to be serializable, therefore we build the scene here and not in the node
watch(
  () => props.modelValue.scenes,
  (newScenes) => {
    // Szenen entfernen
    const keepNames = newScenes.map((s) => s.id)
    for (const sceneName of Array.from(sceneMap.keys())) {
      if (!keepNames.includes(sceneName)) {
        sceneMap.delete(sceneName)
      }
    }

    // --- a) Neue Szene/Actor hinzufügen ---
    for (const sceneReference of newScenes) {
      // get Scene Config from graph
      const sceneNodeId = String(sceneReference.id)
      const sceneNode = graph.value.findNodeById(sceneNodeId)

      if (!sceneNode) continue

      const sceneStateOutputs = sceneNode.outputs as unknown as BasicNodeOutputPorts
      const sceneCalculated = sceneStateOutputs.outputs as unknown as NodeInterface
      const sceneConfig = sceneCalculated.value as unknown as NodeOutput
      const actors: Display2dRendererActorConfig[] = []
      const actorReferences = sceneConfig.values.filter(
        (item) => item.type === 'Export' && item.name === 'ActorNode',
      )

      for (const actorReference of actorReferences) {
        const actorNodeId = String(actorReference.value)
        const actorNode = graph.value.findNodeById(actorNodeId)

        if (!actorNode) continue

        const actorNodeOutputs = actorNode.outputs as unknown as BasicNodeOutputPorts
        const actorNodeCalculated = actorNodeOutputs.outputs as unknown as NodeInterface
        const actorNodeConfig = actorNodeCalculated.value as unknown as NodeOutput

        const actorConfig: Display2dRendererActorConfig = {
          id: actorNodeConfig.id,
          name: actorNodeConfig.name,
          type: actorNodeConfig.type,
          label: actorNodeConfig.name,
          width: actorNodeConfig.width,
          height: actorNodeConfig.height,
          x: 250,
          y: 250,
          color: Color.ExcaliburBlue,
        }
        actors.push(actorConfig)
      }

      const newScene = {
        id: sceneConfig.id,
        name: sceneConfig.name,
        actors: actors,
      }

      // Szene neu anlegen, falls unbekannt
      if (!sceneMap.has(newScene.id)) {
        const scene = new Scene()
        sceneMap.set(newScene.id, scene)
        engine.value?.addScene(newScene.id, scene)
      }

      // Actors
      const scene = sceneMap.get(newScene.id)!
      // entfernte Actors löschen
      const keepIds = newScene.actors.map((a) => a.id!)
      for (const [id, actor] of actorMap) {
        if (!keepIds.includes(id)) {
          scene.remove(actor)
          actorMap.delete(id)
        }
      }
      // neue Actors erzeugen
      for (const actorState of newScene.actors) {
        if (!actorMap.has(actorState.id)) {
          const actor = new Actor(actorState)
          actorMap.set(actorState.id, actor)
          scene.add(actor)
          engine.value?.currentScene.camera.strategy.lockToActor(actor)
        }
      }
    }
  },
  { deep: true },
)
</script>

<template>
  <div id="excalibur-root">
    <section id="excalibur-initialized" v-if="engine">
      <p>Step: {{ modelValue.step }}</p>
      <p>Data Size: {{ modelValue.data.length }}</p>
      <p>FPS: {{ engine.isRunning() ? engine.debug.stats.currFrame.fps.toFixed(0) : 0 }}</p>

      <section id="excalibur-ui">
        <p>
          <button v-if="!engine.isRunning()" @click="startEngine">Start</button>
          <button v-if="engine.isRunning()" @click="engine.stop">Stop</button>
          <button @click="toggleDebug()">Debug ({{ engine.isDebug }})</button>
        </p>

        <p>Scenes</p>
        <ul>
          <li v-for="(scene, key) in engine.scenes" :key="key">
            <button @click="changeScene(String(key))">
              <span v-if="engine.currentSceneName === key">✅</span>{{ key }}
            </button>
          </li>
        </ul>
      </section>

      <section id="excalibur-debug" v-if="engine.isDebug">
        <p><strong>Provided Scenes</strong></p>
        <div v-for="item in modelValue.scenes" :key="item.id">
          <pre>{{ item }}</pre>
        </div>

        <p><strong>Provided Data</strong></p>
        <div v-for="item in modelValue.data" :key="item.id">
          <p>{{ item.type }}: {{ item.name }}</p>
          <pre>{{ item.values }}</pre>
        </div>
      </section>
    </section>

    <canvas ref="canvas" id="excalibur-canvas"></canvas>
  </div>
</template>

<style scoped>
#excalibur-root {
  position: relative;
}

#excalibur-ui {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  text-align: left;
}

#excalibur-debug {
  position: absolute;
  top: 115px;
  right: 0;
  z-index: 1;
  text-align: left;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.6);
}

#excalibur-canvas {
  width: 100%;
  height: 600px;
  border: 1px solid #00000099;
  display: block;
}
</style>
