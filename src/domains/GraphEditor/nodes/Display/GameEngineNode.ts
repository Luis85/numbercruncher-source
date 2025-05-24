import { Node, NodeInterface, type CalculateFunction, allowMultipleConnections } from 'baklavajs'
import type { GraphGlobals, NodeInput, NodeOutput } from '../..'
import type {
  Display2dInputs,
  Display2dOutputs,
  Display2dRendererSceneConfig,
  Display2dRendererState,
} from '.'
import { markRaw } from 'vue'
import Display2dRenderer from '@/domains/UserInterface/components/GraphEditor/Renderer/Display2dRenderer.vue'
import { DISPLAY2D_EMPTY_STATE } from '../../constants/Display2dEmptyState'

export class GameEngineNode extends Node<Display2dInputs, Display2dOutputs> {
  public type = 'GameEngineNode'

  public constructor() {
    super()
    this.title = '💻Game Engine 2d'
    this.width = 850
    this.twoColumn = false
    this.initializeIo()
  }

  public inputs = {
    data: new NodeInterface<NodeOutput[]>('Inputs', []).use(allowMultipleConnections),
  }

  public outputs = {
    renderer: new NodeInterface<Display2dRendererState>('Renderer', { ...DISPLAY2D_EMPTY_STATE })
      .setPort(false)
      .setComponent(markRaw(Display2dRenderer)),
  }

  public calculate: CalculateFunction<Display2dInputs, Display2dOutputs> = (
    inputs,
    { globalValues }: { globalValues: GraphGlobals },
  ) => {
    const data = inputs.data
    const scenes: Display2dRendererSceneConfig[] = []

    const engineConfig: NodeOutput | undefined = data.find((item) => item.type === 'EngineNode')
    const engineValues = engineConfig ? engineConfig.values : []
    const sceneConfigs: NodeInput[] = engineValues.filter(
      (item) => item.name === 'SceneNode' && item.type === 'Export',
    )

    for (const sceneConfig of sceneConfigs) {
      scenes.push({
        id: String(sceneConfig.value),
        type: sceneConfig.type,
        name: sceneConfig.name,
        label: sceneConfig.label,
      })
    }

    return {
      renderer: {
        step: globalValues.step,
        data: inputs.data,
        scenes,
      },
    }
  }
}
