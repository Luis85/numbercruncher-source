import { NodeInterface } from 'baklavajs'
import type { NodeOutput } from '..'
import { BASIC_NODE_EMPTY_OUTPUT_STATE } from '../constants/BasicNodeEmptyOutputState'

export const BASIC_NODE_OUTPUTS = {
  // provide the calculated output for further consumption
  outputs: () => new NodeInterface<NodeOutput>('Output', { ...BASIC_NODE_EMPTY_OUTPUT_STATE }),
  // propagate own id to a designated child
  children: () => new NodeInterface<string>('Children', ''),
}
