import { Node, NodeInterface, type CalculateFunction, allowMultipleConnections } from 'baklavajs'
import type { NodeOutput } from '../..'
import type { Display2dInputs, Display2dOutputs } from '.'
import { markRaw } from 'vue'
import Display2dRenderer from '@/domains/UserInterface/components/GraphEditor/Renderer/Display2dRenderer.vue'

export class Display2dNode extends Node<Display2dInputs, Display2dOutputs> {
  public type = 'Display2dNode'

  public constructor() {
    super()
    this.title = '💻Display 2d'
    this.width = 800
    this.twoColumn = true
    this.initializeIo()
  }

  public inputs = {
    data: new NodeInterface<NodeOutput[]>('Inputs', []).use(allowMultipleConnections),
    renderer: new NodeInterface<number>('Renderer', 0).setPort(false).setComponent(markRaw(Display2dRenderer)),
  }

  public outputs = {
    output: new NodeInterface('Output', 0),
  }

  public calculate: CalculateFunction<Display2dInputs, Display2dOutputs> = ({ data }) => {
    return { output: data.length }
  }
}
