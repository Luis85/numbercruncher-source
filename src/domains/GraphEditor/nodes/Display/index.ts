import type { NodeOutput } from '../..'

export interface Display2dInputs {
  data: NodeOutput[]
}

export interface Display2dOutputs {
  renderer: Display2dRendererState
}

export interface Display2dRendererState {
  step: number
  data: NodeOutput[]
}
