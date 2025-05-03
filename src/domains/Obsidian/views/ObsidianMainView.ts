import { ItemView, type WorkspaceLeaf } from 'obsidian'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/domains/UserInterface/router'
import Vueform from '@vueform/vueform'
import vueformConfig from '../../../../vueform.config'

export const VIEW_TYPE_MAIN = 'numbercruncher-main-view'

export class ObsidianMainView extends ItemView {
  protected vue

  constructor(leaf: WorkspaceLeaf) {
    super(leaf)
    this.vue = createApp(App)
    this.vue.use(createPinia())
    this.vue.use(router)
    this.vue.use(Vueform, vueformConfig)
  }

  async onOpen() {
    const container = this.containerEl.children[1]
    container.empty()
    const element = container.createEl('div', { attr: { id: 'app-main' } })
    this.vue.mount(element)
  }

  getViewType() {
    return VIEW_TYPE_MAIN
  }

  getDisplayText() {
    return 'The Numbercruncher'
  }

  async onClose() {
    this.vue.unmount()
  }

}
