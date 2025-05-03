export interface BasicNodeInterface {
  type: string
  name: string
  inputs: NodeInput[]
  outputs?: NodeOutput
  tags: string[]
  options: string[]
  id?: string
  parent?: string
  color?: string
}
export interface NodeOutput {
  type: string
  id: string
  values: NodeInput[]
}

export interface NodeInput {
  name: string
  value: string | number | boolean | undefined
}

export const BASIC_NODE_EMPTY_STATE = {
  type: 'BasicNode',
  name: 'BasicNode',
  tags: [],
  options: [],
  inputs: [],
  outputs: undefined,
}
