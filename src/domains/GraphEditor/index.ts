
export interface BasicNodeInterface {
  type: string
  name: string
  title: string
  step: number
  width: number
  height: number
  scale: number

  options: NodeOptionConfiguration[]
  tags: string[]
  actions: string[]
  components: string[]
  inputs: NodeOutput[]

  id?: string
  parent?: string
  color?: string
  outputs?: NodeOutput

  [key: string]: string
    | number
    | boolean
    | NodeOutput
    | string[]
    | NodeOutput[]
    | NodeOptionConfiguration[]
    | undefined
}
export interface NodeOutput {
  type: string
  id: string
  values: NodeInput[]
}
export interface NodeInput {
  type: string
  name: string
  value: string | number | boolean | undefined
}
export interface NodeStatistics extends NodeInput {
  type: 'NodeStatistics'
  name: 'inputCount' | 'size'
  value: number | undefined
}
export interface NodeOptionConfiguration {
  type?: string
  name?: string
  value?: string | number | boolean
}


export const BASIC_NODE_TYPES = ['BasicNode']
export const BASIC_NODE_TAGS = ['Actor', 'Scene', 'Component', 'System', 'Supplier', 'Consumer', 'Emitter', 'Subscriber', 'Entity', 'Agent', 'Output', 'Outcome']
export const BASIC_NODE_COMPONENTS = ['TransformComponent', 'MotionComponent', 'GraphicsComponent', 'PointerComponent', 'ActionsComponent']
export const BASIC_NODE_ACTIONS = ['Blink', 'CallMethod', 'Delay', 'EaseTo', 'MoveTo/MoveBy', 'Fade', 'RotateTo/RotateBy', 'Repeat', 'Die', 'Follow', 'Meet', 'ScalteTo/ScaleBy']

export const BASIC_NODE_EMPTY_STATE: BasicNodeInterface = {
  type: 'BasicNode',
  name: 'BasicNode',
  title: 'BasicNode',
  tags: [],
  options: [],
  components: [],
  actions: [],
  inputs: [],
  step: 0,
  width: 0,
  height: 0,
  scale: 1,
  outputs: undefined,
}

export const BASIC_NODE_EMPTY_INPUT_STATE: NodeInput = {
  type: 'NodeInput',
  name: 'NodeInputText',
  value: '',
}

