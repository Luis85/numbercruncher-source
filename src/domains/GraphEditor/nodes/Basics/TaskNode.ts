import { defineNode, AbstractNode, TextareaInputInterface } from 'baklavajs'

export const TaskNode = defineNode({
  type: 'TaskNode',
  title: '✅New Task',
  inputs: {
    text: () => new TextareaInputInterface('Description', '').setPort(false),
  },
  onCreate() {
    const node = this as unknown as AbstractNode
    node.width = 300
  },
})
