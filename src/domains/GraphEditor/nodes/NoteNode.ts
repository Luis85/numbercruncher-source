import { defineNode, NodeInterface, AbstractNode, TextareaInputInterface } from 'baklavajs'

export const NoteNode = defineNode({
  type: 'NoteNode',
  title: '📑Note',
  inputs: {
    text: () => new TextareaInputInterface('Note', '').setPort(false),
  },
  outputs: {
    content: () => new NodeInterface<string>('Content', '').setHidden(true),
  },
  calculate(inputs) {
    // prepare outputs
    const outputs = {
      content: inputs.text,
    }

    return outputs
  },
  onCreate() {
    const node = this as unknown as AbstractNode
    node.width = 300
  },
})
