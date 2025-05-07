import { toPascalCase } from '@/utils/toPascalCase'
import {
  defineDynamicNode,
  SelectInterface,
  AbstractNode,
  NumberInterface,
  TextInputInterface,
} from 'baklavajs'
import { type BasicNodeGlobals, type NodeOptionConfiguration, type NodeOutput } from '../..'
import { basicNodeInputs, basicNodeOutputs, type BasicNodeInputs } from '../../ports'

export const basicNodeConfig = {
  type: 'BasicNode',
  title: '🧱New Node',

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
    const options: NodeOptionConfiguration[] = inputs.options
    const newOptions: NodeOptionConfiguration[] = [...options]
    const keys: string[] = []

    for (const component of inputs.components) {
      const option = node.inputs[toPascalCase(component) + 'Component']
      newOptions.push({
        type: toPascalCase(component) + 'Component',
        name: toPascalCase(component),
        value: option ? option.value : '',
      })
    }

    for (const option of newOptions) {
      if (!option.type || !option.name) continue

      const key = toPascalCase(option.name)
      const value = option.value ?? option.default
      keys.push(key)

      switch (option.type) {
        case 'string':
          dynamic[key] = () => new TextInputInterface(key, typeof value === 'string' ? value : '')
          break

        case 'number':
          dynamic[key] = () => new NumberInterface(key, typeof value === 'number' ? value : 0)
          break

        case 'boolean':
          dynamic[key] = () => new SelectInterface(key, String(value || false), ['true', 'false'])
          break

        case 'list':
          dynamic[key] = () => new SelectInterface(key, String(value ?? ''), [])
          break

        default:
          // Fallback: rudimentärer String-Editor
          dynamic[key] = () => new TextInputInterface(key, String(value ?? ''))
      }
    }

    // feed the viewmodel with values provided by baklava
    inputs.view.id = node.id
    inputs.view.title = node.title
    inputs.view.name = toPascalCase(node.title)

    // feed the viewmodel with the user input from static inputs
    inputs.view.type = toPascalCase(inputs.type)
    inputs.view.description = inputs.description
    inputs.view.view = inputs.nodeView
    inputs.view.color = inputs.color
    inputs.view.width = inputs.width
    inputs.view.height = inputs.height
    inputs.view.scale = inputs.scale
    inputs.view.parent = inputs.parent

    inputs.view.emits = inputs.emits
    inputs.view.subscribes = inputs.subscribes
    inputs.view.exports = inputs.exports
    inputs.view.options = inputs.options

    // ECS
    inputs.view.tags = inputs.tags
    inputs.view.actions = inputs.actions
    inputs.view.components = inputs.components
    inputs.view.resources = inputs.resources

    return {
      inputs: dynamic,
      //forceUpdateInputs: keys
    }
  },

  calculate(inputs: BasicNodeInputs, { globalValues }: { globalValues: BasicNodeGlobals }) {
    const node = this as unknown as AbstractNode
    const { step } = globalValues as unknown as { step: number }
    const size = inputs.inputs.length + 1 + (inputs.parent ? 1 : 0)
    const options: NodeOptionConfiguration[] = [...inputs.options]
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

    for (const component of inputs.components) {
      const option = node.inputs[toPascalCase(component) + 'Component']
      options.push({
        type: toPascalCase(component) + 'Component',
        name: toPascalCase(component),
        value: option ? option.value : '',
      })
    }

    const nodeOutput: NodeOutput = {
      id: node.id,
      type: inputs.type,
      parent: inputs.parent,
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
      ],
    }

    for (const exportedInput of inputs.exports) {
      const input = inputs.inputs.find((item) => item.type === exportedInput)
      if (!input) continue
      nodeOutput.values.push({
        type: 'Export',
        name: input.type,
        value: input.id,
      })
    }

    for (const option of options) {
      if (!option.type || !option.name) continue
      nodeOutput.values.push({
        type: option.type,
        name: toPascalCase(option.name),
        value: node.inputs[toPascalCase(option.name)]?.value ?? '',
      })
    }

    inputs.view.step = step
    inputs.view.inputs = inputs.inputs

    return {
      children: node.id,
      outputs: nodeOutput,
    }
  },
}

export const BasicNode = defineDynamicNode(basicNodeConfig)
