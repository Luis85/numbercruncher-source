import { NodeInterface } from 'baklavajs'
import type { NodeOutput } from '..'
import { BASIC_NODE_EMPTY_OUTPUT_STATE } from '../constants/BasicNodeEmptyOutputState'
import { markRaw } from 'vue'
import BasicDynamicNodeOutput from '@/domains/UserInterface/components/GraphEditor/Node/BasicDynamicNodeOutput.vue'

export const BASIC_NODE_OUTPUTS = {
  // provide the calculated output for further consumption
  outputs: () =>
    new NodeInterface<NodeOutput>('Output', structuredClone(BASIC_NODE_EMPTY_OUTPUT_STATE)),

  // propagate own id to a designated child
  children: () => new NodeInterface<string>('Children', ''),

  /**
   * Node view port, acts as glue to the vue application
   * @todo: rework the viewmodel. Its not needed to duplicate the input structure here as we can easily get the state out of the props.node
   */
  view: () =>
    new NodeInterface<NodeOutput>('View', structuredClone(BASIC_NODE_EMPTY_OUTPUT_STATE))
      .setComponent(markRaw(BasicDynamicNodeOutput))
      .setPort(false),
}
