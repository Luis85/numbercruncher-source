export interface BasicNodeInterface {
  type: string
  description: string
  view: string
  name: string
  title: string
  step: number
  width: number
  height: number
  scale: number

  options: NodeOptionConfiguration[]
  exports: string[]
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
  parent?: string
  values: NodeInput[]
}
export interface NodeInput {
  type: string
  name: string
  value: string | number | boolean | undefined
}

export interface NodeOptionConfiguration {
  type?: string
  name?: string
  value?: string | number | boolean
  default?: string | number | boolean
}

export interface BasicNodeGlobals {
  step: number
}
