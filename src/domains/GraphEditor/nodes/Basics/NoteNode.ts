import { defineNode, AbstractNode, TextareaInputInterface, NodeInterface } from 'baklavajs'

export const NoteNode = defineNode({
  type: 'NoteNode',
  title: '📑New Note',
  inputs: {
    parent: () => new NodeInterface('Parent', ''),
    text: () => new TextareaInputInterface('Description', '').setPort(false),
  },
  outputs: {
    children: () => new NodeInterface('Children', ''),
  },
  calculate() {
    const node = this as unknown as AbstractNode
    return {
      children: node.id,
    }
  },
  onCreate() {
    const node = this as unknown as AbstractNode
    node.width = 450
  },
})
