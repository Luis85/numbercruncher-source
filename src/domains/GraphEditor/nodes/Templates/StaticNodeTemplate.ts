import { Node, NodeInterface, type CalculateFunction, allowMultipleConnections } from 'baklavajs'
import type { NodeOutput } from '../..'

interface input {
  data: NodeOutput[]
}

interface output {
  output: number
}

export class StaticNodeTemplate extends Node<input, output> {
  public type = 'StaticNodeTemplate'

  public constructor() {
    super()
    this.title = 'StaticNodeTemplate'
    this.width = 800
    this.twoColumn = true
    this.initializeIo()
  }

  public inputs = {
    data: new NodeInterface<NodeOutput[]>('Inputs', []).use(allowMultipleConnections),
  }

  public outputs = {
    output: new NodeInterface('Output', 0),
  }

  public calculate: CalculateFunction<input, output> = ({ data }) => {
    return { output: data.length }
  }
}
