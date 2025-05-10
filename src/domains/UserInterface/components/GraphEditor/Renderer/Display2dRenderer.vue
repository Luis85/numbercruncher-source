<script setup lang="ts">
import type {
  Display2dRendererActorConfig,
  Display2dRendererSceneConfig,
  Display2dRendererState,
} from '@/domains/GraphEditor/nodes/Display'
import type { Display2dNode } from '@/domains/GraphEditor/nodes/Display/Display2dNode'
import { Actor, Color, Engine, PointerScope, Scene, Vector, type ActorArgs } from 'excalibur'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { NodeInterface, useGraph } from 'baklavajs'
import type { BasicNodeOutputPorts, NodeOutput } from '@/domains/GraphEditor'
const props = defineProps<{
  modelValue: Display2dRendererState
  node: Display2dNode
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

    addIterationTargetScene('iteration target')

    engine.value.debug.entity.showName = true
    engine.value.debug.entity.showAll = true

    engine.value.toggleDebug()
  }
}

function addIterationTargetScene(name: string) {
  if (!engine.value) return
  const scene = new Scene()
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
  engine.value.addScene(name, scene)
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
  console.log('switched to scene: ' + name)
}

function logState() {
  console.log('graph', graph.value)
  console.log('scenes', scenes.value)
  console.log('engine', engine.value)
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

async function reloadScenes() {
  await buildScenes([])
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

    const systems: string[] = []
    const actors: Display2dRendererActorConfig[] = []

    // add the systems to the scene
    const systemReferences = sceneConfig.values.filter(
      (item) => item.type === 'Export' && item.name === 'SystemNode',
    )
    for (const system of systemReferences) {
      systems.push(String(system.value))
    }

    // add the actors to the scene
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
      const actorComponents = actorNodeConfig.values.filter((item) => item.type === 'Component')
      const actorTags = actorNodeConfig.values.find((item) => item.type === 'NodeTags')
      const tags = actorTags && actorTags.value ? String(actorTags.value).split(', ') : []

      const color =
        actorNodeConfig.color.length >= 6
          ? Color.fromHex(actorNodeConfig.color)
          : Color.ExcaliburBlue

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
    for (const actorConfig of newScene.actors) {
      if (!actorMap.has(actorConfig.id)) {
        const actorArgs: ActorArgs = { ...actorConfig }
        actorArgs.z = 0

        // @todo: extend base actor for event registry
        const actor = new Actor(actorArgs)

        //add tags
        for (const tag of actorConfig.tags) {
          actor.addTag(tag)
        }

        // add components
        for (const component of actorConfig.components) {
          actor.addTag(component)
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
          <button @click="reloadScenes">Reload Scenes</button>
          <button @click="engine.toggleDebug()">Debug ({{ engine.isDebug }})</button>
          <button @click="logState()">Log State</button>
        </p>

        <p><strong>Scenes</strong></p>
        <ul>
          <li v-for="(scene, key) in engine.scenes" :key="key">
            <button @click="changeScene(String(key))">
              <span v-if="engine.currentSceneName === key">✅</span>{{ key }}
            </button>
          </li>
        </ul>
      </section>

      <section id="excalibur-debug" v-if="engine.isDebug">
        <p><strong>Current Scene</strong></p>
        <p>name: {{ engine.currentSceneName }}</p>

        <p><strong>Scene Actors</strong></p>
        <div v-for="actor in engine.currentScene.actors" :key="actor.id">
          <p>id: {{ actor.id }}<br />name: {{ actor.name }}</p>
        </div>

        <p><strong>Stats Current Frame</strong></p>
        <pre>{{ engine.isRunning() ? engine.stats.currFrame : 0 }}</pre>

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

    <canvas ref="canvas" id="excalibur-canvas" :class="(engine && engine.isRunning()) ? 'engine-is-running' : ''"></canvas>
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
  box-shadow: 0 0 5px 0px rgba(0, 0, 0, 0.2);
  display: block;
  transition: all ease 0.2s;
}

#excalibur-canvas.engine-is-running {
  border: 1px solid #000000e0;
  box-shadow: 0 0 8px 2px rgba(16, 145, 201, 0.702);
}
</style>
