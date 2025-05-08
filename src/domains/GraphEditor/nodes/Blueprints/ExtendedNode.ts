import { defineDynamicNode } from 'baklavajs'
import { NumberInterface, TextInputInterface } from 'baklavajs'
import { BASIC_NODE_CONFIG } from '../Basics/BasicNode'

export const ExtendedNode = defineDynamicNode({
  // 1: komplett alles von basicNodeConfig übernehmen
  ...BASIC_NODE_CONFIG,

  // 2: aber type/title überschreiben
  type: 'ExtendedNode',
  title: '🚀 Extended Node',

  // 3: neue Ports mergen
  inputs: {
    ...BASIC_NODE_CONFIG.inputs,
    extraValue: () => new NumberInterface('Extra Value', 42),
  },
  outputs: {
    ...BASIC_NODE_CONFIG.outputs,
    extraResult: () => new TextInputInterface('Extra Result', '').setPort(false),
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
        extraValue: () => new NumberInterface('Extra Value', inputs.extraValue),
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
        type: 'Extended',
        name: 'extraValue',
        value: inputs.extraValue * 2,
        label: '',
      },
    ]
    return {
      ...baseOut,
      extraResult: `Ergebnis: ${inputs.extraValue * 2}`,
    }
  },
})
