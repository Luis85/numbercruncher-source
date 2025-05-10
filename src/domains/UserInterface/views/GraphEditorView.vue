<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch } from 'vue'
import router from '../router/index.ts'

import { BaklavaEditor, useBaklava, Components, Commands } from '@baklavajs/renderer-vue'
import { DependencyEngine, applyResult } from '@baklavajs/engine'
import { AbstractNode, type IEditorState, type IGraphState } from 'baklavajs'
import '@baklavajs/themes/dist/syrup-dark.css'

import { BasicNode } from '@/domains/GraphEditor/nodes/Basics/BasicNode.ts'
import { NoteNode } from '@/domains/GraphEditor/nodes/Basics/NoteNode.ts'
import { TaskNode } from '@/domains/GraphEditor/nodes/Basics/TaskNode.ts'
import { Display2dNode } from '@/domains/GraphEditor/nodes/Display/Display2dNode.ts'

import EditorToolbar from '@/domains/UserInterface/components/GraphEditor/Toolbar/EditorToolbar.vue'
import CustomSidebar from '../components/GraphEditor/Sidebar/CustomSidebar.vue'

const baklava = useBaklava()
const settings = baklava.settings
const editor = baklava.editor
const engine = new DependencyEngine(editor)

const GRAPH_PREFIX = 'numbercruncher_graph_'
const ROOT_NAME = 'root'
const running = ref(false)
let step: number = 0
let ticker: number | null = null

// Liste aller gespeicherten Graph-IDs (ohne Prefix)
const availableGraphs = ref<string[]>([])
// aktuell ausgewählter Graph-Name (ohne Prefix)
const selectedGraph = ref<string>(ROOT_NAME)
// Zwischenspeicher für neue Graph-Namen (Create)
const newGraphName = ref('')
// Zwischenspeicher für Umbenennen
const renameGraphName = ref('')

//  Settings
settings.enableMinimap = true
settings.displayValueOnHover = true

settings.sidebar.resizable = true
settings.sidebar.enabled = true

settings.nodes.resizable = true
settings.nodes.defaultWidth = 300
settings.nodes.maxWidth = 1800
settings.nodes.minWidth = 300

settings.palette.enabled = false

// build additional context menu
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
editor.registerNodeType(TaskNode, { category: 'Basics' })
editor.registerNodeType(Display2dNode, { category: 'Display' })

// add global values
engine.hooks.gatherCalculationData.subscribe(Symbol(), () => ({ step }))

// apply simulation data for the next step
engine.events.afterRun.subscribe(Symbol(), (result) => {
  engine.pause()
  applyResult(result, editor)
  engine.resume()
  step++
})

// Computed für Disable-Zustände
const canCreate = computed(
  () => !!newGraphName.value.trim() && !availableGraphs.value.includes(newGraphName.value.trim()),
)

const isRootSelected = computed(() => selectedGraph.value === ROOT_NAME)
const canDelete = computed(() => !isRootSelected.value)

// Watcher: wenn Auswahl wechselt, vorbefüllen
watch(selectedGraph, (newSel) => {
  renameGraphName.value = newSel
})

/**
 * Wrapper für Speichern+Rename:
 * - Wenn der Benutzer im Rename-Input einen neuen, gültigen Namen eingetragen hat,
 *   führ umbenennen durch (LocalStorage-Key umziehen, Auswahl aktualisieren).
 * - Anschließend Graph-State speichern.
 */
function handleSave() {
  const newName = renameGraphName.value.trim()
  const oldName = selectedGraph.value
  // prüfen, ob wir umbenennen müssen
  if (
    !isRootSelected.value &&
    newName &&
    newName !== oldName &&
    !availableGraphs.value.includes(newName)
  ) {
    const oldId = GRAPH_PREFIX + oldName
    const newId = GRAPH_PREFIX + newName
    const data = localStorage.getItem(oldId)
    if (data) {
      // Key umziehen
      localStorage.setItem(newId, data)
      localStorage.removeItem(oldId)
      // Liste und Auswahl updaten
      refreshList()
      selectedGraph.value = newName
      editor.graph.id = newId
      // Rename-Input zurücksetzen
      renameGraphName.value = newName
      console.log(`renamed: ${oldName} → ${newName}`)
    }
  }
  // dann speichern unter dem aktuellen (ggf. neuen) Namen
  const id = GRAPH_PREFIX + selectedGraph.value
  saveGraph(id)
}

// Hilfsfunktionen
function saveGraph(id: string) {
  const state = editor.save()
  localStorage.setItem(id, JSON.stringify(state))
  console.log(`${id} saved`)
  refreshList()
}

function loadGraph(id: string) {
  const raw = localStorage.getItem(id)
  if (!raw) return
  const state = JSON.parse(raw) as IEditorState
  const warnings = editor.load(state)
  if (warnings.length) console.warn('Load errors:', warnings)
  else console.log(`${id} loaded`)
}

function resetGraph(id: string) {
  engine.stop()
  const graph: IGraphState = {
    id,
    nodes: [],
    connections: [],
    inputs: [],
    outputs: [],
    panning: { x: 400, y: 250 },
    scaling: 0.6,
  }
  editor.load({ graph, graphTemplates: [] })
}

function listSavedGraphs(): string[] {
  return Object.keys(localStorage)
    .filter((k) => k.startsWith(GRAPH_PREFIX))
    .map((k) => k.slice(GRAPH_PREFIX.length))
}

function refreshList() {
  availableGraphs.value = listSavedGraphs()
}

/**
 * Löscht den aktuell ausgewählten Graph (außer Root)
 * und lädt anschließend den Root-Graph.
 */
function deleteGraph() {
  if (isRootSelected.value) return
  // Sicherheits-Abfrage
  if (!confirm(`delete "${selectedGraph.value}"?`)) return

  const id = GRAPH_PREFIX + selectedGraph.value
  localStorage.removeItem(id)
  console.log(`${id} deleted`)
  // Liste updaten und Root laden
  refreshList()
  selectedGraph.value = ROOT_NAME
  loadGraph(GRAPH_PREFIX + ROOT_NAME)
}

// Lifecycle
onMounted(() => {
  // sicherstellen, dass root existiert
  if (!listSavedGraphs().includes(ROOT_NAME)) {
    const rootId = GRAPH_PREFIX + ROOT_NAME
    resetGraph(rootId)
    editor.graph.id = rootId
    saveGraph(rootId)
  }
  refreshList()
  selectedGraph.value = ROOT_NAME
  loadGraph(GRAPH_PREFIX + ROOT_NAME)
})

onBeforeUnmount(() => {
  if (ticker !== null) clearInterval(ticker)
})

// Graph Execution
function handleStart() {
  if (ticker === null) {
    running.value = true
    ticker = window.setInterval(() => engine.runOnce({ step }), 1000)
  }
}
function handleStop() {
  if (ticker !== null) {
    clearInterval(ticker)
    ticker = null
    running.value = false
    step = 0
  }
}

// Aktionen aus den Feldern
function createNew() {
  const name = newGraphName.value.trim()
  if (!name || availableGraphs.value.includes(name)) return
  const id = GRAPH_PREFIX + name
  resetGraph(id)
  editor.graph.id = id
  saveGraph(id)
  selectedGraph.value = name
  newGraphName.value = ''
}

function onSelectChange(name: string) {
  selectedGraph.value = name
  loadGraph(GRAPH_PREFIX + name)
}
</script>

<template>
  <baklava-editor :view-model="baklava" :class="running ? 'is-running' : 'not-running'">
    <template #toolbar>
      <EditorToolbar>
        <template #custom>
          <!-- Settings -->
          <button
            class="baklava-toolbar-button"
            @click="settings.palette.enabled = !settings.palette.enabled"
          >
            Panel {{ settings.palette.enabled }}
          </button>

          <!-- Save / Reset / Simulation -->
          <button class="baklava-toolbar-button" @click="handleSave">💾</button>
          <button class="baklava-toolbar-button" v-if="!running" @click="handleStart">▶️</button>
          <button class="baklava-toolbar-button green" v-if="running" @click="handleStop">
            ⏹️
          </button>
          <button class="baklava-toolbar-button" @click="resetGraph(GRAPH_PREFIX + selectedGraph)">
            ↩️
          </button>

          <!-- Load -->
          <select
            v-model="selectedGraph"
            class="baklava-toolbar-select"
            @change="onSelectChange(selectedGraph)"
          >
            <option v-for="name in availableGraphs" :key="name" :value="name">{{ name }}</option>
          </select>

          <!-- Rename -->
          <input
            :disabled="isRootSelected"
            v-model="renameGraphName"
            placeholder="rename to…"
            class="baklava-toolbar-input"
          />

          <!-- Create -->
          <input v-model="newGraphName" placeholder="Add new graph" class="baklava-toolbar-input" />
          <button class="baklava-toolbar-button" :disabled="!canCreate" @click="createNew">
            ✚ Create
          </button>

          <!-- Delete -->
          <button class="baklava-toolbar-button" v-if="canDelete" @click="deleteGraph">🗑️</button>

          <!-- Nav -->
          <button class="baklava-toolbar-button" @click="router.push('/')">🏡</button>

          <!-- Misc Info -->
          <p class="p-0 mb-0 me-2">Nodes: {{ editor.graph.nodes.length }}</p>
          <p class="p-0 mb-0 me-2">Connections: {{ editor.graph.connections.length }}</p>

          <!-- Scaling and position -->
          <p class="p-0 mb-0 me-2">Scale: {{ editor.graph.scaling.toFixed(2) }}</p>
          <button class="baklava-toolbar-button" @click="editor.graph.scaling = 1">Set to 1</button>
          <p class="p-0 mb-0 me-2">x: {{ editor.graph.panning.x.toFixed(2) }}</p>
          <p class="p-0 mb-0 me-2">y: {{ editor.graph.panning.y.toFixed(2) }}</p>
        </template>
      </EditorToolbar>
    </template>

    <template #node="nodeProps">
      <Components.Node
        :key="nodeProps.node.id"
        v-bind="nodeProps"
        :class="(nodeProps.node as AbstractNode).inputs.type?.value ?? nodeProps.node.type"
      />
    </template>

    <template #sidebar>
      <CustomSidebar />
    </template>
  </baklava-editor>
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

.baklava-node.ActorNode,
.baklava-node.PlayerNode,
.baklava-node.UserNode {
  background-color: rgba(52, 140, 217, 0.6);
}

.baklava-node.TestStepNode,
.baklava-node.TestNode {
  background-color: rgba(10, 137, 17, 0.4);
}
.baklava-node.ActivityNode,
.baklava-node.TaskNode,
.baklava-node.FunctionNode,
.baklava-node.ComponentNode {
  background-color: rgba(255, 237, 34, 0.4);
}

.baklava-node.SceneNode {
  background-color: rgba(70, 18, 116, 0.4);
}

.baklava-node.EventNode {
  background-color: rgba(0, 204, 255, 0.6);
}

.baklava-node.JobToBeDoneNode,
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
.baklava-toolbar-select {
  margin-right: 0.5rem;
  padding: 0.25rem;
}
.baklava-toolbar-input {
  width: 6rem;
  margin-right: 0.25rem;
  padding: 0.25rem;
}
.baklava-toolbar-button {
  margin-right: 0.5rem;
}
</style>
