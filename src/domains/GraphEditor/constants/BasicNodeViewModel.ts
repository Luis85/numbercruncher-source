import type { BasicNodeViewModel } from '..'

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
