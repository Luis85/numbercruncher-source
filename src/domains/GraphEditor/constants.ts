import type { BasicNodeViewModel, NodeInput, NodeOutput } from '.'

export const BASIC_GRAPH_EVENTS = ['GraphStartEvent', 'GraphEndEvent', 'GraphUpdateEvent']

export const BASIC_NODE_EMPTY_STATE: BasicNodeViewModel = {
  type: 'BasicNode',
  description: '',
  view: 'BasicNodeView',
  name: 'BasicNode',
  title: '🧱New Node',
  exports: [],
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

export const BASIC_NODE_VIEWS = ['BasicNodeView']
export const BASIC_NODE_EVENTS = ['NodeUpdateEvent', 'NodeCalculateEvent', 'NodeErrorEvent']
export const BASIC_NODE_TYPES = [
  'BasicNode',
  'ActorNode',
  'SceneNode',
  'EngineNode',
  'ComponentNode',
  'SystemNode',
  'InputMapNode',
  'TestNode',
  'EventNode',
  'ViewNode',
  'FunctionNode',
  'SinkNode',
  'DrainNode',
  'VendorNode',
  'StockNode',
  'MarketNode',
  'DeliverableNode',
  'PiniaStoreNode',
]
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
  'Trigger',
  'Timer',
  'StateMachine',
  'Transform',
  'Motion',
  'Graphics',
  'SvgGraphics',
  'Pointer',
  'Actions',
  'Economics',
  'Evolution',
]
export const BASIC_NODE_ACTIONS = [
  'Use',
  'Take',
  'Jump',
  'Inspect',
  'Lift',
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
