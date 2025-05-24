import { toPascalCase } from '@/utils/toPascalCase'
import {
  defineDynamicNode,
  SelectInterface,
  AbstractNode,
  NumberInterface,
  TextInputInterface,
} from 'baklavajs'
import {
  type GraphGlobals,
  type BasicNodeInputPorts,
  type NodeOptionConfiguration,
  type NodeOutput,
  type BasicNodeOutputPorts,
} from '../..'
import { BASIC_NODE_INPUTS } from '../../ports/InputPorts'
import { BASIC_NODE_OUTPUTS } from '../../ports/OutputPorts'

export const BASIC_DYNAMIC_NODE_CONFIG = {
  type: 'BasicNode',
  title: '🧱New Node',

  inputs: BASIC_NODE_INPUTS,
  outputs: BASIC_NODE_OUTPUTS,

  onCreate() {
    const node = this as unknown as AbstractNode
    node.width = 850
    node.twoColumn = true
  },

  /**
   * Node onUpdate
   *
   * prepares all the dynamic input nodes and syncs the view with them
   *
   */
  onUpdate(inputs: BasicNodeInputPorts) {
    const node = this as unknown as AbstractNode
    const dynamicInputs: NodeOptionConfiguration[] = [...inputs.options]
    const dynamic: Record<string, () => TextInputInterface | NumberInterface | SelectInterface> = {}

    if (node.title === '🧱New Node' && inputs.type !== 'BasicNode') {
      node.title = 'New ' + inputs.type
    }

    // add selected components to the inputs
    for (const component of inputs.components) {
      const option = node.inputs[toPascalCase(component) + 'Component']
      dynamicInputs.push({
        type: toPascalCase(component) + 'Component',
        name: toPascalCase(component),
        value: option ? option.value : '',
      })
    }

    // create the dynamic inputs out of the dynamicInputs array
    for (const dynamicInput of dynamicInputs) {
      if (!dynamicInput.type || !dynamicInput.name) continue

      const key = toPascalCase(dynamicInput.name)
      const value = dynamicInput.value ?? dynamicInput.default

      switch (dynamicInput.type) {
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

    /**
     * @Todo: this section is not needed, why do we need to repopulate the viewmodel here?
     * we can easily access the node in the renderer and grab the input state from there
     * this creates some unnecessary roundtrips between the nodes and the view updates
     */
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
    inputs.view.schema = inputs.schema

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
    }
  },

  /**
   * # Node Calculate function
   *
   * ## Workflow
   * - creates the node statistics
   * - adds the selected components to the output
   * - adds the selected inputs to the output
   * - adds the created options to the output
   *
   * note: it will propably make sense to add a state-machine here
   */
  calculate(
    inputs: BasicNodeInputPorts,
    { globalValues }: { globalValues: GraphGlobals },
  ): BasicNodeOutputPorts {
    const node = this as unknown as AbstractNode
    const { step } = globalValues as unknown as { step: number }
    const options: NodeOptionConfiguration[] = [...inputs.options]
    const size = inputs.inputs.length + (inputs.parent ? 1 : 0) + 1
    let complexity = 0

    // determine the paths complexity
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

    // build the output object
    const nodeOutput: NodeOutput = {
      id: node.id,
      type: inputs.type,
      name: node.title,
      parent: inputs.parent,
      width: inputs.width,
      height: inputs.height,
      color: inputs.color,
      x: inputs.x,
      y: inputs.y,
      z: inputs.z,
      scale: inputs.scale,
      opacity: 1,
      visible: true,
      values: [],
      options: [],
    }

    // add the selected tags
    nodeOutput.values.push({
      type: 'NodeTags',
      name: 'Tags',
      label: 'Tags',
      value: inputs.tags.join(', '),
    })

    // add the selected components to the output
    for (const component of inputs.components) {
      const option = node.inputs[toPascalCase(component)]
      if (!option) continue
      nodeOutput.values.push({
        type: 'Component',
        name: option.name + 'Component',
        label: option.name,
        value: option.value,
      })
    }

    /**
     * add the exported nodes
     */
    for (const exportedInput of inputs.exports) {
      const input = inputs.inputs.find((item) => item.id === exportedInput.value)
      if (!input) continue

      const type = input.type === 'ComponentNode' ? 'Component' : 'Export'
      const name = type === 'Component' ? input.name : input.type
      const value = type === 'Component' ? '' : input.id
      nodeOutput.values.push({
        type,
        name,
        label: input.name,
        value,
      })
    }

    /**
     * add the created options
     */
    for (const option of options) {
      if (!option.type || !option.name) continue
      const optionInput = node.inputs[toPascalCase(option.name)]
      if (!optionInput) continue
      option.value = optionInput.value
      nodeOutput.options.push(option)
    }

    /**
     * add the node statistics
     */
    const nodeStats = [
      {
        type: 'NodeStatistics',
        name: 'inputCount',
        label: 'statistics',
        value: inputs.inputs.length,
      },
      {
        type: 'NodeStatistics',
        name: 'size',
        label: 'statistics',
        value: size,
      },
      {
        type: 'NodeStatistics',
        name: 'complexity',
        label: 'statistics',
        value: complexity,
      },
    ]
    nodeOutput.values.push(...nodeStats)

    inputs.view.step = step
    inputs.view.inputs = inputs.inputs

    return {
      children: node.id,
      outputs: nodeOutput,
      view: nodeOutput,
    }
  },
}

export const BasicNode = defineDynamicNode(BASIC_DYNAMIC_NODE_CONFIG)
