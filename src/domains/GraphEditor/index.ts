export interface GraphGlobals {
  step: number
}

export interface BasicNodeInputPorts {
  type: string
  parent: string | undefined
  description: string
  nodeView: string
  color: string
  schema: string

  width: number
  height: number
  scale: number
  x: number
  y: number
  z: number

  options: NodeOptionConfiguration[]
  exports: SidebarOption[]
  tags: string[]
  emits: string[]
  subscribes: string[]
  actions: string[]
  components: string[]
  resources: string[]
  inputs: NodeOutput[]

  view: BasicNodeViewModel
}

export interface BasicNodeOutputPorts {
  children: string
  outputs: NodeOutput
  view: NodeOutput
}

export interface BasicNodeViewModel {
  type: string
  description: string
  view: string
  name: string
  title: string
  schema: string
  step: number
  width: number
  height: number
  scale: number

  options: NodeOptionConfiguration[]
  exports: SidebarOption[]
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
    | SidebarOption[]
    | undefined
}

export interface NodeOutput {
  type: string
  id: string
  name: string
  parent?: string
  width: number
  height: number
  color: string
  scale: number
  x: number
  y: number
  z: number
  opacity: number
  visible: boolean
  values: NodeInput[]
  options: NodeOptionConfiguration[]
}
export interface NodeInput {
  type: string
  name: string
  label: string
  value: string | number | boolean | undefined
}

export interface NodeOptionConfiguration {
  type?: string
  name?: string
  label?: string
  value?: string | number | boolean
  default?: string | number | boolean
}

export interface SidebarOption {
  type: string
  name: string
  label: string
  disabled: boolean
  value?: string | number | boolean | SidebarOption[] | undefined
}
