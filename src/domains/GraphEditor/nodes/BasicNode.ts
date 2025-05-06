import { toPascalCase } from '@/utils/toPascalCase'
import {
  defineDynamicNode,
  SelectInterface,
  AbstractNode,
  NumberInterface,
  TextInputInterface,
} from 'baklavajs'
import { type BasicNodeGlobals, type NodeOutput, type NodeStatistics } from '..'
import { basicNodeInputs, basicNodeOutputs, type BasicNodeInputs } from '../ports'

export const basicNodeConfig = {
  type: 'BasicNode',
  title: '🧱Node',

  inputs: basicNodeInputs,
  outputs: basicNodeOutputs,

  onCreate() {
    const node = this as unknown as AbstractNode
    node.width = 650
    node.twoColumn = true
  },

  onUpdate(inputs: BasicNodeInputs) {
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

  calculate(inputs: BasicNodeInputs, { globalValues }: { globalValues: BasicNodeGlobals }) {
    const node = this as unknown as AbstractNode
    const { step } = globalValues as unknown as { step: number }

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

    const nodeOutput: NodeOutput = {
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
      outputs: nodeOutput,
    }

    return outputs
  },
}

export const BasicNode = defineDynamicNode(basicNodeConfig)
