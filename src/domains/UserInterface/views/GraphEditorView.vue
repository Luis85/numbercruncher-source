<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import router from '../router/index.ts'

import { BaklavaEditor, useBaklava, Commands, Components } from '@baklavajs/renderer-vue'
import { DependencyEngine, applyResult } from '@baklavajs/engine'
import { type IEditorState, type IGraphState } from 'baklavajs'
import '@baklavajs/themes/dist/syrup-dark.css'

import EditorToolbar from '@/domains/UserInterface/components/GraphEditor/Toolbar/EditorToolbar.vue'
import CustomSidebar from '../components/GraphEditor/Sidebar/CustomSidebar.vue'

import { BasicNode } from '@/domains/GraphEditor/nodes/BasicNode'
import { NoteNode } from '@/domains/GraphEditor/nodes/NoteNode'
import type { BasicNode as BasicNodeNodeConstructor } from '@/domains/GraphEditor/nodes/BasicNode'
import { ExtendedNode } from '@/domains/GraphEditor/nodes/ExtendedNode.ts'

type BasicNode = InstanceType<typeof BasicNodeNodeConstructor>

const baklava = useBaklava()
const editor = baklava.editor
const token = Symbol('token')
const settings = baklava.settings
const BaklavaNode = Components.Node
const engine = new DependencyEngine(editor)
const graphTitle = 'current-graph'
const graphName = 'numbercruncher-' + graphTitle
const running = ref<boolean>(false)

let step = 0
let ticker: number | null = null

settings.enableMinimap = true
settings.displayValueOnHover = true

settings.sidebar.resizable = true
settings.sidebar.enabled = true

settings.nodes.resizable = true
settings.nodes.defaultWidth = 300
settings.nodes.maxWidth = 1200
settings.nodes.minWidth = 300

settings.palette.enabled = true

settings.contextMenu.additionalItems = [
  { isDivider: true },
  { label: 'Zoom Fit', command: Commands.ZOOM_TO_FIT_GRAPH_COMMAND },
  { label: 'Box Select', command: Commands.START_SELECTION_BOX_COMMAND },
  { label: 'Create Subgraph', command: Commands.CREATE_SUBGRAPH_COMMAND },
  { label: 'Copy Selected', command: Commands.COPY_COMMAND },
  { label: 'Paste', command: Commands.PASTE_COMMAND },
  { label: 'Delete Selected', command: Commands.DELETE_NODES_COMMAND },
]

// node registry
editor.registerNodeType(BasicNode, { category: 'Basics' })
editor.registerNodeType(NoteNode, { category: 'Basics' })
editor.registerNodeType(ExtendedNode, { category: 'Blueprints' })

// build the global state object
engine.hooks.gatherCalculationData.subscribe(token, () => {
  return { step: step }
})

// apply calculation results to the graph
engine.events.afterRun.subscribe(token, (result) => {
  engine.pause()
  applyResult(result, editor)
  engine.resume()
  step++
})

function handleStart() {
  if (ticker === null) {
    running.value = true
    ticker = window.setInterval(() => {
      engine.runOnce({ step })
    }, 1000)
  }
}

function handleStop() {
  if (ticker !== null) {
    step = 0
    running.value = false
    clearInterval(ticker)
    ticker = null
  }
}

function save() {
  console.log('Saving to localstorage')
  window.localStorage.setItem(graphName, JSON.stringify(editor.save()))
}

function load() {
  const state = window.localStorage.getItem(graphName)

  if (!state) {
    return
  }

  try {
    editor.load(JSON.parse(state))
    console.log('Loaded state from localStorage')
  } catch (e) {
    console.error(e)
    return
  }
}

function resetGraph() {
  engine.stop()
  const graph: IGraphState = {
    id: graphName,
    nodes: [],
    connections: [],
    inputs: [],
    outputs: [],
    panning: {
      x: 400,
      y: 250,
    },
    scaling: 0.6,
  }
  const state: IEditorState = {
    graph,
    graphTemplates: [],
  }
  editor.load(state)
}

function logGraph() {
  console.log(editor.graph)
}

onMounted(() => {
  load()
})

onBeforeUnmount(() => {
  if (ticker !== null) {
    clearInterval(ticker)
  }
})
</script>

<template>
  <baklava-editor :view-model="baklava" :class="running ? 'is-running' : 'not-running'">
    <template #toolbar>
      <EditorToolbar>
        <template #custom>
          <button
            v-if="!running"
            class="baklava-toolbar-entry baklava-toolbar-button"
            title="Start Simulation"
            @click="handleStart"
          >
            ▶️
          </button>

          <button
            v-if="running"
            class="baklava-toolbar-entry baklava-toolbar-button green"
            title="Stop Simulation"
            @click="handleStop"
          >
            ⏹️
          </button>

          <button
            class="baklava-toolbar-entry baklava-toolbar-button"
            title="Save Flow"
            @click="save"
          >
            💾
          </button>

          <button
            class="baklava-toolbar-entry baklava-toolbar-button"
            title="Reload last Save"
            @click="load"
          >
            ♻️
          </button>

          <button
            class="baklava-toolbar-entry baklava-toolbar-button"
            title="Reset Simulation"
            @click="resetGraph"
          >
            ↩️
          </button>

          <button
            class="baklava-toolbar-entry baklava-toolbar-button"
            title="Log graph"
            @click="logGraph"
          >
            🔎
          </button>

          <button
            class="baklava-toolbar-entry baklava-toolbar-button"
            title="Home"
            @click="router.push('/')"
          >
            🏡
          </button>
        </template>
      </EditorToolbar>
    </template>
    <template #node="nodeProps">
      <BaklavaNode
        :key="nodeProps.node.id"
        v-bind="nodeProps"
        :class="(nodeProps.node as BasicNode).inputs.type?.value"
      />
    </template>
    <template #sidebar>
      <CustomSidebar />
    </template>
  </baklava-editor>
</template>

<style>
.baklava-editor {
  position: absolute;
}
.baklava-node-palette {
  padding: 0rem 1rem 0 1rem;
}
.baklava-node-palette h1 {
  margin-top: 0;
  font-size: 1em;
}
.baklava-toolbar {
  padding: 0.5rem;
}
</style>
