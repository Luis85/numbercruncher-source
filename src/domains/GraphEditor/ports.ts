import {
  NodeInterface,
  allowMultipleConnections,
  SelectInterface,
  displayInSidebar,
  NumberInterface,
} from 'baklavajs'
import { markRaw } from 'vue'
import type { NodeOutput, BasicNodeInterface, NodeOptionConfiguration } from '.'
import {
  BASIC_NODE_EMPTY_STATE,
  BASIC_NODE_TYPES,
  BASIC_NODE_VIEWS,
  BASIC_NODE_EMPTY_OUTPUT_STATE,
} from './constants'

import BasicNodeRenderer from '@/domains/UserInterface/components/GraphEditor/Node/BasicNode.vue'
import SidebarTags from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarTags.vue'
import SidebarEmitEvents from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarEmitEvents.vue'
import SidebarSubscribeEvents from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarSubscribeEvents.vue'
import SidebarActions from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarActions.vue'
import SidebarOptions from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarOptions.vue'
import SidebarColor from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarColor.vue'
import SidebarComponents from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarComponents.vue'
import SidebarResources from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarResources.vue'

export const basicNodeInputs = {
  // ports for other nodes to connect to
  parent: () => new NodeInterface<string | undefined>('Parent', undefined),
  inputs: () => new NodeInterface<NodeOutput[]>('Inputs', []).use(allowMultipleConnections),

  // Node view port, acts as glue to the vue application
  view: () =>
    new NodeInterface<BasicNodeInterface>('View', structuredClone(BASIC_NODE_EMPTY_STATE))
      .setComponent(markRaw(BasicNodeRenderer))
      .setPort(false),

  // Sidebar Options
  type: () =>
    new SelectInterface('Type', 'BasicNode', structuredClone(BASIC_NODE_TYPES))
      .setHidden(true)
      .use(displayInSidebar, true)
      .setPort(false),
  nodeView: () =>
    new SelectInterface('View', 'BasicNodeView', structuredClone(BASIC_NODE_VIEWS))
      .setHidden(true)
      .use(displayInSidebar, true)
      .setPort(false),
  width: () =>
    new NumberInterface('Width', 0).setHidden(true).use(displayInSidebar, true).setPort(false),
  height: () =>
    new NumberInterface('Height', 0).setHidden(true).use(displayInSidebar, true).setPort(false),
  scale: () =>
    new NumberInterface('Scale', 1).setHidden(true).use(displayInSidebar, true).setPort(false),
  color: () =>
    new NodeInterface<string>('Color', '')
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarColor))
      .setPort(false),

  // Event System
  emits: () =>
    new NodeInterface<string[]>('Emits', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarEmitEvents))
      .setPort(false),
  subscribes: () =>
    new NodeInterface<string[]>('Subscribes', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarSubscribeEvents))
      .setPort(false),

  // ECS Settings
  tags: () =>
    new NodeInterface<string[]>('Tags', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarTags))
      .setPort(false),
  actions: () =>
    new NodeInterface<string[]>('Actions', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarActions))
      .setPort(false),
  components: () =>
    new NodeInterface<string[]>('Components', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarComponents))
      .setPort(false),
  resources: () =>
    new NodeInterface<string[]>('Resources', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarResources))
      .setPort(false),
  options: () =>
    new NodeInterface<NodeOptionConfiguration[]>('Options', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarOptions))
      .setPort(false),
}

export const basicNodeOutputs = {
  // propagate own id to a designated child
  children: () => new NodeInterface<string>('Children', ''),
  // provide the calculated output for further consumption
  outputs: () => new NodeInterface<NodeOutput>('Outputs', { ...BASIC_NODE_EMPTY_OUTPUT_STATE }),
}

export interface BasicNodeInputs {
  parent: string | undefined
  inputs: NodeOutput[]
  view: BasicNodeInterface
  type: string
  nodeView: string
  width: number
  height: number
  scale: number
  color: string
  emits: string[]
  subscribes: string[]
  tags: string[]
  actions: string[]
  components: string[]
  resources: string[]
  options: NodeOptionConfiguration[]
}

/** Die Ports unter `outputs:` */
export interface BasicNodeOutputs {
  children: string
  outputs: NodeOutput
}

/** Dein globalValues-Objekt aus dem Graph */
export interface BasicNodeGlobals {
  step: number
}
