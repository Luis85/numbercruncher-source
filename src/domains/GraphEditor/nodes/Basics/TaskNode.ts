import { defineNode, AbstractNode, TextareaInputInterface, NodeInterface } from 'baklavajs'

export const TaskNode = defineNode({
  type: 'TaskNode',
  title: '✅New Task',
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
