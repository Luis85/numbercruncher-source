<script lang="ts">
import { computed, defineComponent } from 'vue'
import { Commands } from '@baklavajs/renderer-vue'
import * as Icons from '../../Icons'
import { useViewModel } from 'baklavajs'
import ToolbarButton from './ToolbarButton.vue'

export default defineComponent({
  components: { ToolbarButton },
  setup() {
    const { viewModel } = useViewModel()

    const isSubgraph = computed(
      () => viewModel.value.displayedGraph !== viewModel.value.editor.graph,
    )

    const commands = [
      { command: Commands.COPY_COMMAND, title: 'Copy', icon: Icons.Copy },
      { command: Commands.PASTE_COMMAND, title: 'Paste', icon: Icons.Clipboard },
      { command: Commands.DELETE_NODES_COMMAND, title: 'Delete selected nodes', icon: Icons.Trash },
      { command: Commands.UNDO_COMMAND, title: 'Undo', icon: Icons.ArrowBackUp },
      { command: Commands.REDO_COMMAND, title: 'Redo', icon: Icons.ArrowForwardUp },
      { command: Commands.ZOOM_TO_FIT_GRAPH_COMMAND, title: 'Zoom to Fit', icon: Icons.ZoomScan },
      { command: Commands.START_SELECTION_BOX_COMMAND, title: 'Box Select', icon: Icons.SelectAll },
      {
        command: Commands.CREATE_SUBGRAPH_COMMAND,
        title: 'Create Subgraph',
        icon: Icons.Hierarchy2,
      },
    ]

    const subgraphCommands = [
      { command: Commands.SAVE_SUBGRAPH_COMMAND, title: 'Save Subgraph', icon: Icons.DeviceFloppy },
      {
        command: Commands.SWITCH_TO_MAIN_GRAPH_COMMAND,
        title: 'Back to Main Graph',
        icon: Icons.ArrowLeft,
      },
    ]

    return { isSubgraph, commands, subgraphCommands }
  },
})
</script>

<template>
  <div class="baklava-toolbar" @contextmenu.stop.prevent="">

    <toolbar-button
      v-for="c in commands"
      :key="c.command"
      :command="c.command"
      :title="c.title"
      :icon="c.icon"
    />

    <template v-if="isSubgraph">
      <toolbar-button
        v-for="c in subgraphCommands"
        :key="c.command"
        :command="c.command"
        :title="c.title"
        :icon="c.icon"
      />
    </template>

    <slot name="custom"></slot>
  </div>
</template>
