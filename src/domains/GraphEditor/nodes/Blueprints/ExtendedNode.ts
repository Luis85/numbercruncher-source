import { defineDynamicNode } from 'baklavajs'
import { NumberInterface, TextInputInterface } from 'baklavajs'
import { basicNodeConfig } from '../Basics/BasicNode'

export const ExtendedNode = defineDynamicNode({
  // 1: komplett alles von basicNodeConfig übernehmen
  ...basicNodeConfig,

  // 2: aber type/title überschreiben
  type: 'ExtendedNode',
  title: '🚀 Extended Node',

  // 3: neue Ports mergen
  inputs: {
    ...basicNodeConfig.inputs,
    extraValue: () => new NumberInterface('Extra Value', 42),
  },
  outputs: {
    ...basicNodeConfig.outputs,
    extraResult: () => new TextInputInterface('Extra Result', '').setPort(false),
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
        extraValue: () => new NumberInterface('Extra Value', inputs.extraValue),
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
        type: 'Extended',
        name: 'extraValue',
        value: inputs.extraValue * 2,
      },
    ]
    return {
      ...baseOut,
      extraResult: `Ergebnis: ${inputs.extraValue * 2}`,
    }
  },
})
