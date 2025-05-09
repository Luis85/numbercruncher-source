import type { Color, Vector } from 'excalibur'
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
  scenes: Display2dRendererSceneConfig[]
}

export interface Display2dRendererSceneConfig {
  id: string
  type: string
  name: string
  label: string
}

export interface Display2dRendererActorConfig {
  id: string
  type: string
  name: string
  label: string
  width: number
  height: number
  color: Color
  pos: Vector
  z: number
  tags: string[]
  components: string[]
}
