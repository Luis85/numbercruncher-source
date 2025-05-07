import { defineNode, AbstractNode, TextareaInputInterface } from 'baklavajs'

export const NoteNode = defineNode({
  type: 'NoteNode',
  title: '📑New Note',
  inputs: {
    text: () => new TextareaInputInterface('Note', '').setPort(false),
  },
  onCreate() {
    const node = this as unknown as AbstractNode
    node.width = 300
  },
})
