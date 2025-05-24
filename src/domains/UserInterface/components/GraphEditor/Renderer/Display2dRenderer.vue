<script setup lang="ts">
import type {
  Display2dRendererActorConfig,
  Display2dRendererSceneConfig,
  Display2dRendererState,
} from '@/domains/GraphEditor/nodes/Display'
import type { GameEngineNode } from '@/domains/GraphEditor/nodes/Display/GameEngineNode'
import { Actor, Color, Engine, PointerScope, Scene, vec, Vector, type ActorArgs } from 'excalibur'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { NodeInterface, useGraph } from 'baklavajs'
import type { BasicNodeOutputPorts, NodeInput, NodeOutput } from '@/domains/GraphEditor'
import { PlaygroundScene } from '@/domains/ExcaliburJs/scenes/PlaygroundScene'
import { TargetSearchComponent } from '@/domains/ExcaliburJs/components/TargetSearchComponent'
import { ActorWanderBehaviourComponent } from '@/domains/ExcaliburJs/components/ActorWanderBehaviourComponent'
import { BasicScene } from '@/domains/ExcaliburJs/scenes/BasicScene'
const props = defineProps<{
  modelValue: Display2dRendererState
  node: GameEngineNode
  intf: NodeInterface<Display2dRendererState>
}>()

defineEmits<{
  (e: 'openSidebar'): void
}>()

const { graph } = useGraph()

const canvas = ref<HTMLCanvasElement | null>(null)
const engine = ref<Engine>()

const scenes = ref<Display2dRendererSceneConfig[]>([])
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
      backgroundColor: Color.fromHex('#00000099'),
      pointerScope: PointerScope.Canvas,
    })

    const playground = new PlaygroundScene()
    engine.value.add('Playground', playground)

    engine.value.debug.entity.showName = true
    engine.value.debug.entity.showAll = true

    engine.value.toggleDebug()
  }
}

function startEngine() {
  if (!engine.value) return
  engine.value.start().then(function () {
    console.log('engine started')
  })
}

async function changeScene(name: string) {
  if (!engine.value) return
  await engine.value.goToScene(name)
  await repaintScreen()
  console.log('switched to scene: ' + name)
}

function logState() {
  console.log('graph', graph.value)
  console.log('scenes', scenes.value)
  console.log('engine', engine.value)
}

async function reloadScenes() {
  if (!engine.value) return
  await buildScenes([])
  await repaintScreen()
}

async function repaintScreen() {
  if (!engine.value) return
  const isRunning = engine.value.isRunning()
  await engine.value.start()
  engine.value.stop()
  if (isRunning) engine.value.start()
}

async function buildScenes(newScenes: Display2dRendererSceneConfig[]) {
  if (!engine.value) return
  // Szenen entfernen
  const keepNames = newScenes.map((scene) => scene.id)
  for (const sceneName of Array.from(sceneMap.keys())) {
    if (!keepNames.includes(sceneName)) {
      if (engine.value.currentSceneName === sceneName) {
        await changeScene('root')
      }
      const tobedeletedScene = sceneMap.get(sceneName)
      if (!tobedeletedScene) continue
      tobedeletedScene.clear()
      engine.value.removeScene(sceneName)
      sceneMap.delete(sceneName)
      actorMap.clear()
    }
  }
  scenes.value = newScenes
  loadScenes()
}

function loadScenes() {
  for (const sceneReference of scenes.value) {
    // get Scene Config from graph
    const sceneNodeId = String(sceneReference.id)
    const sceneNode = graph.value.findNodeById(sceneNodeId)

    if (!sceneNode) continue

    const sceneStateOutputs = sceneNode.outputs as unknown as BasicNodeOutputPorts
    const sceneCalculated = sceneStateOutputs.outputs as unknown as NodeInterface
    const sceneConfig = sceneCalculated.value as unknown as NodeOutput

    // get system config
    const systemReferences = sceneConfig.values.filter(
      (item) => item.type === 'Export' && item.name === 'SystemNode',
    )

    // get actor config
    const actorReferences = sceneConfig.values.filter(
      (item) => item.type === 'Export' && item.name === 'ActorNode',
    )

    // build scene config
    const newScene = {
      id: sceneConfig.id,
      name: sceneConfig.name,
      actors: buildActorConfig(actorReferences),
    }
    const systems = systemReferences.map((item) => item.label)

    // create new scene if non existant, and add systems
    if (!sceneMap.has(newScene.id)) {
      const scene = new BasicScene(newScene.id, newScene.name, systems)
      sceneMap.set(newScene.id, scene)
      engine.value?.addScene(newScene.id, scene)
    }
    const scene = sceneMap.get(newScene.id)!

    // add actors
    // entfernte Actors löschen
    const keepIds = newScene.actors.map((a) => a.id!)
    for (const [id, actor] of actorMap) {
      if (!keepIds.includes(id)) {
        scene.remove(actor)
        actorMap.delete(id)
      }
    }
    // neue Actors erzeugen
    for (const actorConfig of newScene.actors) {
      if (!actorMap.has(actorConfig.id)) {
        const actorArgs: ActorArgs = { ...actorConfig }
        // @todo: extend base actor for event registry
        const actor = new Actor(actorArgs)

        //add tags
        for (const tag of actorConfig.tags) {
          actor.addTag(tag)
        }

        // add components
        // @todo: add component registry and make them configurable from node input
        for (const component of actorConfig.components) {
          actor.addTag(component)
          if (component === 'TargetSearchComponent') {
            actor.addComponent(new TargetSearchComponent(vec(600, 400)))
          }
          if (component === 'ActorWanderBehaviourComponent') {
            actor.addComponent(new ActorWanderBehaviourComponent())
          }
        }

        actorMap.set(actorConfig.id, actor)
        scene.add(actor)

        actor.events.on('pointerenter', () => {
          actor.graphics.opacity = 0.2
        })
        actor.events.on('pointerleave', () => {
          actor.graphics.opacity = 1
        })
        actor.events.on('pointerdown', () => {
          console.log(actor)
        })
      }
    }
  }
}

function buildActorConfig(actorReferences: NodeInput[]): Display2dRendererActorConfig[] {
  const actors: Display2dRendererActorConfig[] = []
  for (const actorReference of actorReferences) {
    const actorNodeId = String(actorReference.value)
    const actorNode = graph.value.findNodeById(actorNodeId)

    if (!actorNode) continue

    const actorNodeOutputs = actorNode.outputs as unknown as BasicNodeOutputPorts
    const actorNodeCalculated = actorNodeOutputs.outputs as unknown as NodeInterface
    const actorNodeConfig = actorNodeCalculated.value as unknown as NodeOutput
    const actorComponents = actorNodeConfig.values.filter((item) => item.type === 'Component')
    const actorTags = actorNodeConfig.values.find((item) => item.type === 'NodeTags')
    const tags = actorTags && actorTags.value ? String(actorTags.value).split(', ') : []

    const color =
      actorNodeConfig.color.length >= 6 ? Color.fromHex(actorNodeConfig.color) : Color.ExcaliburBlue

    const actorConfig: Display2dRendererActorConfig = {
      id: actorNodeConfig.id,
      name: actorNodeConfig.name,
      type: actorNodeConfig.type,
      label: actorNodeConfig.name,
      width: actorNodeConfig.width,
      height: actorNodeConfig.height,
      z: actorNodeConfig.z,
      color: color,
      pos: new Vector(actorNodeConfig.x, actorNodeConfig.y),
      components: actorComponents.map((item) => item.name),
      tags: tags,
    }
    actors.push(actorConfig)
  }
  return actors
}

watch(
  () => props.modelValue.scenes,
  async (newScenes) => {
    if (!engine.value) return
    await buildScenes(newScenes)
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
  <div id="excalibur-root">
    <section id="excalibur-initialized" v-if="engine">
      <p>Step: {{ modelValue.step }}</p>
      <p>Data Size: {{ modelValue.data.length }}</p>
      <p>FPS: {{ engine.isRunning() ? engine.debug.stats.currFrame.fps.toFixed(0) : 0 }}</p>

      <section id="excalibur-ui">
        <p>
          <button v-if="!engine.isRunning()" @click="startEngine">▶️Start</button>
          <button v-if="engine.isRunning()" @click="engine.stop">🛑Stop</button>
          <button @click="reloadScenes">Reload</button>
          <button @click="engine.toggleDebug()">Debug ({{ engine.isDebug }})</button>
          <button @click="logState()">Log State</button>
        </p>

        <p><strong>Scenes</strong></p>
        <ul>
          <li v-for="(scene, key) in engine.scenes" :key="key">
            <button @click="changeScene(String(key))">
              <span v-if="engine.currentSceneName === key">✅</span
              >{{ (scene as unknown as BasicScene).name ?? key }}
            </button>
          </li>
        </ul>
      </section>

      <section id="excalibur-debug" v-if="engine.isDebug">
        <div v-if="engine.isRunning()">
          <p class="mb-0">Elapsed Time: {{ engine.stats.currFrame.elapsedMs.toFixed(2) }}</p>
          <p>FPS: {{ engine.stats.currFrame.fps.toFixed(2) }}</p>

          <p><strong>Current Scene</strong></p>
          <p class="mb-0">id: {{ (engine.currentScene as unknown as BasicScene).id }}</p>
          <p>name: {{ (engine.currentScene as unknown as BasicScene).name }}</p>
          <p>Collisions: {{ engine.stats.currFrame.physics.collisions }}</p>
          <pre>{{ engine.stats.currFrame.actors }}</pre>
        </div>

        <p class="mb-0"><strong>Provided Scenes</strong></p>
        <div v-for="item in modelValue.scenes" :key="item.id">
          <pre>{{ item }}</pre>
        </div>

        <p><strong>Provided Data</strong></p>
        <div v-for="item in modelValue.data" :key="item.id">
          <p class="mb-0">{{ item.type }}: {{ item.name }}</p>
          <pre>{{ item.values }}</pre>
        </div>
      </section>
    </section>

    <canvas
      ref="canvas"
      id="excalibur-canvas"
      :class="engine && engine.isRunning() ? 'engine-is-running' : ''"
    ></canvas>
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
  border: 10px solid #00000082;
  box-shadow: 0 0 5px 0px rgba(0, 0, 0, 0.2);
  display: block;
  transition: all ease 0.2s;
  background-color: #000000af;
}

#excalibur-canvas.engine-is-running {
  border-color: #00000099;
  box-shadow: 0 0 8px 2px rgba(16, 145, 201, 0.702);
  background-color: transparent;
}
</style>
