<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import router from '../router/index.ts'

import { BaklavaEditor, useBaklava, Components, Commands } from '@baklavajs/renderer-vue'
import { DependencyEngine, applyResult } from '@baklavajs/engine'
import { AbstractNode, type IEditorState, type IGraphState } from 'baklavajs'
import '@baklavajs/themes/dist/syrup-dark.css'

import { BasicNode } from '@/domains/GraphEditor/nodes/Basics/BasicDynamicNode.ts'
import { NoteNode } from '@/domains/GraphEditor/nodes/Basics/NoteNode.ts'
import { TaskNode } from '@/domains/GraphEditor/nodes/Basics/TaskNode.ts'
import { GameEngineNode } from '@/domains/GraphEditor/nodes/Display/GameEngineNode.ts'

import EditorToolbar from '@/domains/UserInterface/components/GraphEditor/Toolbar/EditorToolbar.vue'
import CustomSidebar from '../components/GraphEditor/Sidebar/CustomSidebar.vue'
import { HtmlMarkupNode } from '@/domains/GraphEditor/nodes/Basics/MarkupNode.ts'

const baklava = useBaklava()
const settings = baklava.settings
const editor = baklava.editor
const engine = new DependencyEngine(editor)

const GRAPH_PREFIX = 'numbercruncher_graph_'
const ROOT_NAME = 'root'
const running = ref(false)
let step: number = 0

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
editor.registerNodeType(BasicNode)
editor.registerNodeType(NoteNode)
editor.registerNodeType(TaskNode)
editor.registerNodeType(HtmlMarkupNode, { category: 'Documents' })
editor.registerNodeType(GameEngineNode, { category: 'Display' })

// add global values
engine.hooks.gatherCalculationData.subscribe(Symbol(), () => ({ step }))

// apply simulation data for the next step
engine.events.afterRun.subscribe(Symbol(), (result) => {
  engine.pause()
  applyResult(result, editor)
  engine.resume()
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

// Node Selection and Sidebar behaviour
const selectedNodes = computed(() => {
  return baklava.editor.graph.selectedNodes
})
const siedbarVisible = computed(() => {
  return editor.graph.sidebar.visible
})
watch(selectedNodes, (newSel) => {
  if (newSel.length === 0) {
    editor.graph.sidebar.nodeId = ''
    editor.graph.sidebar.visible = false
  }
})
watch(siedbarVisible, (isVisible) => {
  if (!isVisible) {
    editor.graph.sidebar.nodeId = ''
  }
})
function handleSelect(id: string) {
  if (id === editor.graph.sidebar.nodeId && editor.graph.sidebar.visible) return
  editor.graph.sidebar.nodeId = id
  editor.graph.sidebar.visible = true
}
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

// Graph Execution
function handleStart() {
  engine.start()
  running.value = true
}
function handleStop() {
  engine.stop()
  running.value = false
  step = 0
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
        <template #start>
          <!-- Settings -->
          <button
            class="baklava-toolbar-button"
            @click="settings.palette.enabled = !settings.palette.enabled"
          >
            Panel {{ settings.palette.enabled ? '⬅️' : '➡️' }}
          </button>
        </template>

        <template #end>
          <!-- Save / Reset / Simulation -->
          <button class="baklava-toolbar-button" title="Save current graph" @click="handleSave">
            💾
          </button>
          <button
            class="baklava-toolbar-button"
            title="Start Execution Engine"
            v-if="!running"
            @click="handleStart"
          >
            ▶️
          </button>
          <button
            class="baklava-toolbar-button green"
            title="Stop Execution Engine"
            v-if="running"
            @click="handleStop"
          >
            ⏹️
          </button>
          <button
            class="baklava-toolbar-button"
            title="Reload current graph"
            @click="resetGraph(GRAPH_PREFIX + selectedGraph)"
          >
            ↩️
          </button>

          <!-- Nav -->
          <button class="baklava-toolbar-button" title="Dashboard" @click="router.push('/')">
            🏡
          </button>

          <!-- Load -->
          <select
            v-model="selectedGraph"
            v-if="availableGraphs.length > 0"
            class="baklava-toolbar-select"
            title="Change graph"
            @change="onSelectChange(selectedGraph)"
          >
            <option v-for="name in availableGraphs" :key="name" :value="name">{{ name }}</option>
          </select>

          <!-- Rename -->
          <input
            :disabled="isRootSelected"
            v-model="renameGraphName"
            placeholder="rename graph to…"
            class="baklava-toolbar-input"
          />

          <!-- Create -->
          <input v-model="newGraphName" placeholder="Add new graph" class="baklava-toolbar-input" />
          <button
            v-if="newGraphName.length >= 3"
            class="baklava-toolbar-button"
            :disabled="!canCreate"
            @click="createNew"
          >
            ✚ Create
          </button>

          <!-- Delete -->
          <button
            class="baklava-toolbar-button"
            title="Delete graph"
            v-if="canDelete"
            @click="deleteGraph"
          >
            🗑️
          </button>

          <section class="toolbar-meta" title="Graph Meta Data">
            <!-- Misc Info -->
            <span class="me-2">Nodes: {{ editor.graph.nodes.length }}</span>
            <span class="me-2">Connections: {{ editor.graph.connections.length }}</span>

            <!-- Scaling and position -->
            <p class="p-0 mb-0 me-2">
              <span class="me-2">Scale: {{ editor.graph.scaling.toFixed(2) }}</span>
              <span class="baklava-toolbar-button" @click="editor.graph.scaling = 1">Set to 1</span>
            </p>
            <span class="me-2">x: {{ editor.graph.panning.x.toFixed(2) }}</span>
            <span class="me-2">y: {{ editor.graph.panning.y.toFixed(2) }}</span>
          </section>
        </template>
      </EditorToolbar>
    </template>

    <template #node="nodeProps">
      <Components.Node
        :key="nodeProps.node.id"
        v-bind="nodeProps"
        @dblclick="handleSelect(nodeProps.node.id)"
        :class="[
          (nodeProps.node as AbstractNode).inputs.type?.value ?? nodeProps.node.type,
          nodeProps.node.id === editor.graph.sidebar.nodeId ? '--in-sidebar' : '',
        ]"
      />
    </template>

    <template #sidebar>
      <CustomSidebar />
    </template>
  </baklava-editor>
</template>

<style>
#app-main .baklava-node {
  border: 1px solid rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 5px 0px rgba(0, 0, 0, 0.2);
}

#app-main .baklava-select > .__selected,
#app-main .baklava-num-input,
#app-main .baklava-checkbox .__checkmark-container,
#app-main .baklava-input {
  border: 1px solid rgba(0, 0, 0, 0.65);
  box-shadow: inset 1px 1px 3px 0px rgba(0, 0, 0, 0.5);
}

#app-main .baklava-node:hover {
  box-shadow: 0 0 15px 3px rgba(119, 255, 0, 0.6);
}

#app-main .baklava-node.--selected.--dragging {
  box-shadow: 0 0 25px 3px rgba(255, 238, 0, 0.6);
}

#app-main .baklava-node.--selected {
  border: 1px solid rgb(137, 255, 34);
}

#app-main .baklava-node.--in-sidebar {
  border: 1px solid rgb(0, 22, 59);
  box-shadow: 0 0 15px 3px rgba(22, 162, 255, 0.777);
}

#app-main .baklava-slider > .__slider {
  background-color: hsla(160, 100%, 37%, 1);
}

#app-main .baklava-node.ViewNode.--two-column > .__content {
  grid-template-columns: minmax(0, 30%) 1fr;
  grid-auto-rows: auto;
}

#app-main .baklava-node.ViewNode.--two-column > .__content > .__inputs {
  grid-row: 1;
  grid-column: 1;
}

#app-main .baklava-node.ViewNode.--two-column > .__content > .__outputs {
  grid-row: 1;
  grid-column: 2;
}

#app-main .baklava-node.--two-column > .__content {
  column-gap: 25px;
}

.baklava-node.EntityNode > .__title,
.baklava-node.ComponentNode > .__title {
  background-color: rgba(104, 104, 104, 0.4);
}

.baklava-node.ActorNode > .__title,
.baklava-node.PlayerNode > .__title,
.baklava-node.UserNode > .__title,
.baklava-node.UseCaseNode > .__title {
  background-color: rgba(52, 140, 217, 0.6);
}

.baklava-node.TestStepNode > .__title,
.baklava-node.TestNode > .__title {
  background-color: rgba(10, 137, 17, 0.4);
}
.baklava-node.ActivityNode > .__title,
.baklava-node.TaskNode > .__title,
.baklava-node.FunctionNode > .__title {
  background-color: rgba(255, 237, 34, 0.4);
}

.baklava-node.ViewNode > .__title,
.baklava-node.UserInterfaceNode > .__title,
.baklava-node.ContainerNode > .__title,
.baklava-node.SceneNode > .__title {
  background-color: rgba(117, 51, 175, 0.4);
}

.baklava-node.EventNode > .__title {
  background-color: rgba(0, 204, 255, 0.6);
}

.baklava-node.JobToBeDoneNode > .__title,
.baklava-node.StockNode > .__title,
.baklava-node.EngineNode > .__title,
.baklava-node.SystemNode > .__title {
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
  padding: 1rem 1rem 0 1rem;
}
.baklava-node-palette h1 {
  margin-top: 0;
  font-size: 1em;
}
.baklava-toolbar {
  padding: 0.5rem;
}
.toolbar-meta {
  font-size: 9px;
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
