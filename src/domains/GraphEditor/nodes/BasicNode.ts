
import { markRaw } from "vue";
import { toPascalCase } from "@/utils/toPascalCase";
import { defineNode, NodeInterface, allowMultipleConnections, displayInSidebar, SelectInterface, AbstractNode, NumberInterface } from "baklavajs";
import { BASIC_NODE_EMPTY_STATE, BASIC_NODE_TYPES, type BasicNodeInterface, type NodeOptionConfiguration, type NodeOutput } from "..";

import BasicNodeRenderer from "@/domains/UserInterface/components/GraphEditor/Node/BasicNode.vue";
import SidebarTags from "@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarTags.vue";
import SidebarActions from "@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarActions.vue";
import SidebarOptions from "@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarOptions.vue";
import SidebarColor from "@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarColor.vue";
import SidebarComponents from "@/domains/UserInterface/components/GraphEditor/Sidebar/SidebarComponents.vue";

export const BasicNode = defineNode({
    type: 'BasicNode',
    title: 'Basic Node',
    inputs: {
      // ports to connect to
      parent: () => new NodeInterface<string | undefined>('Parent', undefined),
      inputs: () => new NodeInterface<NodeOutput[]>('Inputs', []).use(allowMultipleConnections),

      // Node view port, acts as glue to the vue application
      view: () => new NodeInterface<BasicNodeInterface>('View', structuredClone(BASIC_NODE_EMPTY_STATE)).setComponent(markRaw(BasicNodeRenderer)).setPort(false),

      // Sidebar Options
      type: () => new SelectInterface("Type", "BasicNode", structuredClone(BASIC_NODE_TYPES)).setHidden(true).use(displayInSidebar, true).setPort(false),
      width: () => new NumberInterface("Width", 0).setHidden(true).use(displayInSidebar, true).setPort(false),
      height: () => new NumberInterface("Height", 0).setHidden(true).use(displayInSidebar, true).setPort(false),
      scale: () => new NumberInterface("Scale", 1).setHidden(true).use(displayInSidebar, true).setPort(false),
      color: () => new NodeInterface<string>("Color", '').setHidden(true).use(displayInSidebar, true).setComponent(markRaw(SidebarColor)).setPort(false),

      // ECS Settings
      tags: () => new NodeInterface<string[]>("Tags", []).setHidden(true).use(displayInSidebar, true).setComponent(markRaw(SidebarTags)).setPort(false),
      actions: () => new NodeInterface<string[]>("Actions", []).setHidden(true).use(displayInSidebar, true).setComponent(markRaw(SidebarActions)).setPort(false),
      components: () => new NodeInterface<string[]>("Components", []).setHidden(true).use(displayInSidebar, true).setComponent(markRaw(SidebarComponents)).setPort(false),
      options: () => new NodeInterface<NodeOptionConfiguration[]>("Options", []).setHidden(true).use(displayInSidebar, true).setComponent(markRaw(SidebarOptions)).setPort(false),
    },

    outputs: {
      // propagate own id to a designated child
      children: () => new NodeInterface<string>("Children", ''),
      // provide the calculated output for further consumption
      outputs: () => new NodeInterface<NodeOutput | undefined>("Outputs", undefined),
    },

    calculate(inputs, { globalValues }) {
      const node = this as unknown as AbstractNode
      const { step } = globalValues as { step: number }

      // feed the viewmodel with values provided by baklava
      inputs.view.id = node.id
      inputs.view.title = node.title
      inputs.view.name = toPascalCase(node.title)
      inputs.view.step = step

      // feed the viewmodel for the next step with the user input
      inputs.view.type = inputs.type
      inputs.view.color = inputs.color
      inputs.view.width = inputs.width
      inputs.view.height = inputs.height
      inputs.view.scale = inputs.scale
      inputs.view.parent = inputs.parent
      inputs.view.inputs = inputs.inputs
      inputs.view.tags = inputs.tags
      inputs.view.components = inputs.components
      inputs.view.options = inputs.options

      // prepare outputs
      const outputs = {
        children: node.id,
        outputs: inputs.view.outputs,
      }

      return outputs
    },

    onCreate() {
      const node = this as unknown as AbstractNode
      node.width = 650
      node.twoColumn = true
    },
})
