import { defineDynamicNode } from 'baklavajs'
import { BASIC_NODE_CONFIG } from '../Basics/BasicNode'

export const Display2dNode = defineDynamicNode({
  // 1: komplett alles von basicNodeConfig übernehmen
  ...BASIC_NODE_CONFIG,

  // 2: aber type/title überschreiben
  type: 'Display2dNode',
  title: '💻Display 2d',

  // 3: neue Ports mergen
  inputs: {
    ...BASIC_NODE_CONFIG.inputs,
  },
  outputs: {
    ...BASIC_NODE_CONFIG.outputs,
  },

  // 4: onCreate-Handler erweitern
  onCreate() {
    BASIC_NODE_CONFIG.onCreate!.call(this)
    // eigene Logik …
  },

  // 5: onUpdate-Handler erweitern
  onUpdate(inputs) {
    const base = BASIC_NODE_CONFIG.onUpdate!.call(this, inputs)
    return {
      inputs: {
        ...base.inputs,
      },
      // forceUpdate usw. von base ggf. beibehalten …
    }
  },

  // 6: calculate erweitern
  calculate(inputs, ctx) {
    const baseOut = BASIC_NODE_CONFIG.calculate!.call(this, inputs, ctx)
    baseOut.outputs.values = [
      ...baseOut.outputs.values,
      {
        type: 'Display2d',
        name: 'extraValue',
        value: inputs.extraValue * 2,
        label: '',
      },
    ]
    return {
      ...baseOut,
    }
  },
})
