import { defineNode, NodeInterface, allowMultipleConnections, displayInSidebar, SelectInterface, AbstractNode, TextInputInterface } from "baklavajs";
import { markRaw } from "vue";
import BasicNodeRenderer from "@/domains/UserInterface/components/GraphEditor/Node/BasicNode.vue";
import { BASIC_NODE_EMPTY_STATE, type BasicNodeInterface, type NodeInput, type NodeOutput } from "..";

export const BasicNode = defineNode({
    type: "BasicNode",
    inputs: {
      parent: () => new NodeInterface<string | undefined>('Parent', undefined),
      inputs: () => new NodeInterface<NodeInput[]>('Inputs', []).use(allowMultipleConnections),
      view: () => new NodeInterface<BasicNodeInterface>('View', structuredClone(BASIC_NODE_EMPTY_STATE)).setComponent(markRaw(BasicNodeRenderer)).setPort(false),

      type: () => new SelectInterface("Type", "BasicNode", ["BasicNode"]).setHidden(true).use(displayInSidebar, true).setPort(false),
      tags: () => new TextInputInterface("Tags (CSV)", '').setHidden(true).use(displayInSidebar, true),
      options: () => new TextInputInterface("Options (CSV)", '').setHidden(true).use(displayInSidebar, true),
    },
    outputs: {
      children: () => new NodeInterface<string>("Children", ''),
      outputs: () => new NodeInterface<NodeOutput | undefined>("Outputs", undefined),
    },
    calculate(inputs) {
      const node = this as unknown as AbstractNode
      inputs.view.id = node.id
      inputs.view.type = inputs.type
      inputs.view.name = node.title
      inputs.view.parent = inputs.parent
      inputs.view.inputs = inputs.inputs
      inputs.view.tags = inputs.tags.length > 0 ? inputs.tags.split(',').map((s) => s.trim()) : []
      inputs.view.options = inputs.options.length > 0 ? inputs.options.split(',').map((s) => s.trim()) : []

      return {
        children: node.id,
        outputs: inputs.view.outputs,
      }
    },

    onCreate() {
      const node = this as unknown as AbstractNode
      node.width = 650
      node.twoColumn = true
    },
})
