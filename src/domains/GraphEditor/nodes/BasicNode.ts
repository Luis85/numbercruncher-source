import { markRaw } from 'vue'
import { toPascalCase } from '@/utils/toPascalCase'
import {
  defineDynamicNode,
  NodeInterface,
  allowMultipleConnections,
  displayInSidebar,
  SelectInterface,
  AbstractNode,
  NumberInterface,
  TextInputInterface,
} from 'baklavajs'
import {
  BASIC_NODE_EMPTY_OUTPUT_STATE,
  BASIC_NODE_EMPTY_STATE,
  BASIC_NODE_TYPES,
  BASIC_NODE_VIEWS,
  type BasicNodeInterface,
  type NodeOptionConfiguration,
  type NodeOutput,
  type NodeStatistics,
} from '..'

import BasicNodeRenderer from '@/domains/UserInterface/components/GraphEditor/Node/BasicNode.vue'
import SidebarTags from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarTags.vue'
import SidebarEmitEvents from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarEmitEvents.vue'
import SidebarSubscribeEvents from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarSubscribeEvents.vue'
import SidebarActions from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarActions.vue'
import SidebarOptions from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarOptions.vue'
import SidebarColor from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarColor.vue'
import SidebarComponents from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarComponents.vue'
import SidebarResources from '@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarResources.vue'

export const BasicNode = defineDynamicNode({
  type: 'BasicNode',
  title: '🧱Node',
  // static interfaces
  inputs: {
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
  },

  outputs: {
    // propagate own id to a designated child
    children: () => new NodeInterface<string>('Children', ''),
    // provide the calculated output for further consumption
    outputs: () => new NodeInterface<NodeOutput>('Outputs', { ...BASIC_NODE_EMPTY_OUTPUT_STATE }),
  },

  onUpdate(inputs) {
    const node = this as unknown as AbstractNode
    const dynamic: Record<string, () => TextInputInterface | NumberInterface | SelectInterface> = {}
    const keys: string[] = []

    for (const option of inputs.options) {
      if (!option.type || !option.name) continue

      const key = toPascalCase(option.name)
      const value = option.value ?? option.default
      keys.push(key)

      switch (option.type) {
        case 'string':
          dynamic[key] = () =>
            new TextInputInterface(key, typeof value === 'string' ? value : '').setPort(false)
          break

        case 'number':
          dynamic[key] = () =>
            new NumberInterface(key, typeof value === 'number' ? value : 0).setPort(false)
          break

        case 'boolean':
          dynamic[key] = () =>
            new SelectInterface(key, String(value || false), ['true', 'false']).setPort(false)
          break

        case 'list':
          dynamic[key] = () => new SelectInterface(key, String(value ?? ''), []).setPort(false)
          break

        default:
          // Fallback: rudimentärer String-Editor
          dynamic[key] = () => new TextInputInterface(key, String(value ?? '')).setPort(false)
      }
    }

    for (const component of inputs.components) {
      dynamic[component] = () => new TextInputInterface(toPascalCase(component), '').setPort(false)
    }

    for (const action of inputs.actions) {
      dynamic[action] = () =>
        new TextInputInterface(toPascalCase(action) + 'Action', '').setPort(false)
    }

    for (const resource of inputs.resources) {
      dynamic[resource] = () =>
        new TextInputInterface(toPascalCase(resource) + 'Resource', '').setPort(false)
    }

    // feed the viewmodel with values provided by baklava
    inputs.view.id = node.id
    inputs.view.title = node.title
    inputs.view.name = toPascalCase(node.title)

    // feed the viewmodel with the user input from static inputs
    inputs.view.type = toPascalCase(inputs.type)
    inputs.view.view = inputs.nodeView
    inputs.view.color = inputs.color
    inputs.view.width = inputs.width
    inputs.view.height = inputs.height
    inputs.view.scale = inputs.scale
    inputs.view.parent = inputs.parent

    inputs.view.emits = inputs.emits
    inputs.view.subscribes = inputs.subscribes

    // ECS
    inputs.view.tags = inputs.tags
    inputs.view.actions = inputs.actions
    inputs.view.components = inputs.components
    inputs.view.resources = inputs.resources
    inputs.view.options = inputs.options

    return {
      inputs: dynamic,
      //forceUpdateInputs: keys
    }
  },

  calculate(inputs, { globalValues }) {
    const node = this as unknown as AbstractNode
    const { step } = globalValues as { step: number }

    inputs.view.step = step
    inputs.view.inputs = inputs.inputs

    const size = inputs.inputs.length + 1 + (inputs.parent ? 1 : 0)
    let complexity = 0
    for (const input of inputs.inputs) {
      const metric = input.values.find(
        (item) => item.type === 'NodeStatistics' && item.name === 'complexity',
      )
      if (metric) complexity += Number(metric.value)
    }

    complexity += size
    complexity += inputs.emits.length
    complexity += inputs.subscribes.length
    complexity += inputs.components.length
    complexity += inputs.actions.length
    complexity += inputs.resources.length
    complexity += inputs.options.length

    const output: NodeOutput = {
      id: node.id,
      type: inputs.type,
      values: [
        {
          type: 'NodeStatistics',
          name: 'inputCount',
          value: inputs.inputs.length,
        },
        {
          type: 'NodeStatistics',
          name: 'size',
          value: size,
        },
        {
          type: 'NodeStatistics',
          name: 'complexity',
          value: complexity,
        },
        {
          type: 'NodeStatistics',
          name: 'step',
          value: step,
        },
      ] as NodeStatistics[],
    }

    // prepare outputs
    const outputs = {
      children: node.id,
      outputs: output,
    }

    return outputs
  },

  onCreate() {
    const node = this as unknown as AbstractNode
    node.width = 650
    node.twoColumn = true
  },
})
