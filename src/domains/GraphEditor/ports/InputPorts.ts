import {
  NodeInterface,
  allowMultipleConnections,
  SelectInterface,
  displayInSidebar,
  NumberInterface,
  TextareaInputInterface,
  TextInputInterface,
} from 'baklavajs'
import { markRaw } from 'vue'
import type { NodeOutput, BasicNodeViewModel, NodeOptionConfiguration, SidebarOption } from '..'

import BasicNodeRenderer from '@/domains/UserInterface/components/GraphEditor/Node/BasicNode.vue'
import SidebarTags from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarTags.vue'
import SidebarEmitEvents from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarEmitEvents.vue'
import SidebarSubscribeEvents from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarSubscribeEvents.vue'
import SidebarActions from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarActions.vue'
import SidebarOptions from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarOptions.vue'
import SidebarColor from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarColor.vue'
import SidebarComponents from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarComponents.vue'
import SidebarResources from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarResources.vue'
import SidebarOutputComposer from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarOutputComposer.vue'

import { BASIC_NODE_TYPES } from '../constants/BasicNodeTypes'
import { BASIC_NODE_EMPTY_STATE } from '../constants/BasicNodeViewModel'
import { BASIC_NODE_VIEWS } from '../constants/BasicNodeViews'

export const BASIC_NODE_INPUTS = {
  // ports for other nodes to connect to
  inputs: () => new NodeInterface<NodeOutput[]>('Inputs', []).use(allowMultipleConnections),
  parent: () => new NodeInterface<string | undefined>('Parent', undefined),

  /**
   * Node view port, acts as glue to the vue application
   * @todo: rework the viewmodel. Its not needed to duplicate the input structure here as we can easily get the state out of the props.node
   */
  view: () =>
    new NodeInterface<BasicNodeViewModel>('View', structuredClone(BASIC_NODE_EMPTY_STATE))
      .setComponent(markRaw(BasicNodeRenderer))
      .setPort(false),

  // Sidebar Options
  type: () =>
    new SelectInterface('Type', 'BasicNode', structuredClone(BASIC_NODE_TYPES))
      .setHidden(true)
      .use(displayInSidebar, true)
      .setPort(false),
  description: () =>
    new TextareaInputInterface('Description', '')
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
  x: () =>
    new NumberInterface('X', 0).setHidden(true).use(displayInSidebar, true).setPort(false),
  y: () =>
    new NumberInterface('Y', 0).setHidden(true).use(displayInSidebar, true).setPort(false),
  z: () =>
    new NumberInterface('Z', 0).setHidden(true).use(displayInSidebar, true).setPort(false),
  schema: () =>
    new TextInputInterface('Schema', '').setHidden(true).use(displayInSidebar, true).setPort(false),

  // Node Shape
  color: () =>
    new NodeInterface<string>('Color', '')
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarColor))
      .setPort(false),
  options: () =>
    new NodeInterface<NodeOptionConfiguration[]>('Options', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarOptions))
      .setPort(false),
  exports: () =>
    new NodeInterface<SidebarOption[]>('Output Composer', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarOutputComposer))
      .setPort(false),
  components: () =>
    new NodeInterface<string[]>('Components', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarComponents))
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

  /**
   * ECS System
   *
   * @todo: needs rework to be object[] based instead of string[], the interfaces also needs overhaul as they currently get the whole viewmodel which is not needed here.
   */
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
  resources: () =>
    new NodeInterface<string[]>('Resources', [])
      .setHidden(true)
      .use(displayInSidebar, true)
      .setComponent(markRaw(SidebarResources))
      .setPort(false),
}
