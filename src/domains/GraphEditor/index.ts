export interface BasicNodeInterface {
  type: string
  view: string
  name: string
  title: string
  step: number
  width: number
  height: number
  scale: number

  options: NodeOptionConfiguration[]
  tags: string[]
  emits: string[]
  subscribes: string[]
  actions: string[]
  components: string[]
  inputs: NodeOutput[]

  id?: string
  parent?: string
  color?: string
  outputs?: NodeOutput

  [key: string]:
    | string
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
  default?: string | number | boolean
}

export const BASIC_NODE_TYPES = [
  'BasicNode',
  'ActorNode',
  'ComponentNode',
  'SystemNode',
  'SceneNode',
  'EngineNode',
  'StockNode',
  'AssemblerNode',
  'TestNode',
  'EventNode',
  'ViewNode',
]
export const BASIC_NODE_VIEWS = ['BasicNodeView']
export const BASIC_NODE_EVENTS = ['NodeUpdateEvent', 'NodeCalculateEvent', 'NodeErrorEvent']
export const BASIC_GRAPH_EVENTS = ['GraphStartEvent', 'GraphEndEvent', 'GraphUpdateEvent']
export const BASIC_NODE_TAGS = [
  'External',
  'Vendor',
  'Supplier',
  'Consumer',
  'Producer',
  'Process',
  'Product',
  'Project',
  'Spawner',
  'Replicator',
  'Risk',
  'Requirement',
  'Agent',
  'Population',
  'Area',
  'Output',
  'Outcome',
  'RaceTrack',
]
export const BASIC_NODE_COMPONENTS = [
  'StateMachineComponent',
  'TransformComponent',
  'MotionComponent',
  'GraphicsComponent',
  'SvgGraphicsComponent',
  'PointerComponent',
  'ActionsComponent',
  'EconomicsComponent',
  'EvolutionComponent',
]
export const BASIC_NODE_ACTIONS = [
  'Blink',
  'CallMethod',
  'Delay',
  'EaseTo',
  'MoveTo/MoveBy',
  'Fade',
  'RotateTo/RotateBy',
  'Repeat',
  'Die',
  'Follow',
  'Meet',
  'ScalteTo/ScaleBy',
]

export const BASIC_NODE_EMPTY_STATE: BasicNodeInterface = {
  type: 'BasicNode',
  view: 'BasicNodeView',
  name: 'BasicNode',
  title: 'BasicNode',
  tags: [],
  options: [],
  components: [],
  actions: [],
  inputs: [],
  emits: [],
  subscribes: [],
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

export const BASIC_NODE_EMPTY_OUTPUT_STATE: NodeOutput = {
  id: '',
  type: 'NodeOutput',
  values: [],
}
