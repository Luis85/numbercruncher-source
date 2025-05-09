import { Node, NodeInterface, type CalculateFunction, allowMultipleConnections } from 'baklavajs'
import type { GraphGlobals, NodeOutput } from '../..'
import type { Display2dInputs, Display2dOutputs, Display2dRendererState } from '.'
import { markRaw } from 'vue'
import Display2dRenderer from '@/domains/UserInterface/components/GraphEditor/Renderer/Display2dRenderer.vue'

export class Display2dNode extends Node<Display2dInputs, Display2dOutputs> {
  public type = 'Display2dNode'

  public constructor() {
    super()
    this.title = '💻Display 2d'
    this.width = 850
    this.twoColumn = false
    this.initializeIo()
  }

  public inputs = {
    data: new NodeInterface<NodeOutput[]>('Inputs', []).use(allowMultipleConnections),
  }

  public outputs = {
    renderer: new NodeInterface<Display2dRendererState>('Renderer', { step: 0, data: [] })
      .setPort(false)
      .setComponent(markRaw(Display2dRenderer)),
  }

  public calculate: CalculateFunction<Display2dInputs, Display2dOutputs> = (
    inputs,
    { globalValues }: { globalValues: GraphGlobals },
  ) => {
    return {
      renderer: {
        step: globalValues.step,
        data: inputs.data,
      },
    }
  }
}
