import { defineDynamicNode } from 'baklavajs'
import { basicNodeConfig } from '../Basics/BasicNode'

export const Display2dNode = defineDynamicNode({
  // 1: komplett alles von basicNodeConfig übernehmen
  ...basicNodeConfig,

  // 2: aber type/title überschreiben
  type: 'Display2dNode',
  title: '💻Display 2d',

  // 3: neue Ports mergen
  inputs: {
    ...basicNodeConfig.inputs,
  },
  outputs: {
    ...basicNodeConfig.outputs,
  },

  // 4: onCreate-Handler erweitern
  onCreate() {
    basicNodeConfig.onCreate!.call(this)
    // eigene Logik …
  },

  // 5: onUpdate-Handler erweitern
  onUpdate(inputs) {
    const base = basicNodeConfig.onUpdate!.call(this, inputs)
    return {
      inputs: {
        ...base.inputs,
      },
      // forceUpdate usw. von base ggf. beibehalten …
    }
  },

  // 6: calculate erweitern
  calculate(inputs, ctx) {
    const baseOut = basicNodeConfig.calculate!.call(this, inputs, ctx)
    baseOut.outputs.values = [
      ...baseOut.outputs.values,
      {
        type: 'Display2d',
        name: 'extraValue',
        value: inputs.extraValue * 2,
      },
    ]
    return {
      ...baseOut,
    }
  },
})
