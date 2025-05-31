import { defineNode, AbstractNode, TextareaInputInterface, NodeInterface } from 'baklavajs'
import type { NodeInput, NodeOutput } from '../..'
import { BASIC_NODE_EMPTY_OUTPUT_STATE } from '../../constants/BasicNodeEmptyOutputState'

export const HtmlMarkupNode = defineNode({
  type: 'HtmlMarkupNode',
  title: '🔣Markup',
  inputs: {
    text: () => new TextareaInputInterface('Html', '').setPort(false),
  },
  outputs: {
    output: () =>
      new NodeInterface<NodeOutput>('Output', structuredClone(BASIC_NODE_EMPTY_OUTPUT_STATE)),
  },
  calculate(inputs) {
    const node = this as unknown as AbstractNode
    const value: NodeInput = {
      type: node.type,
      name: node.title.toLowerCase(),
      label: 'Content',
      value: inputs.text,
    }
    const output: NodeOutput = {
      type: node.type,
      id: node.id,
      name: node.title,
      width: node.width,
      height: 0,
      color: '',
      scale: 0,
      x: 0,
      y: 0,
      z: 0,
      opacity: 0,
      visible: false,
      values: [value],
      options: [],
    }
    return {
      output,
    }
  },
  onCreate() {
    const node = this as unknown as AbstractNode
    node.twoColumn = false
    node.width = 450
  },
})
