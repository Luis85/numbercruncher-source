import './assets/main.css'

import { Plugin, Notice, type WorkspaceLeaf } from 'obsidian'
import { type ObsidianPluginSettings, DEFAULT_SETTINGS } from './domains/Obsidian/settings'
import { ObsidianPluginSettingTab } from './domains/Obsidian/settings/ObsidianPluginSettingTab'
import { ObsidianMainView, VIEW_TYPE_MAIN } from './domains/Obsidian/views/ObsidianMainView'

export default class ObsidianPlugin extends Plugin {
  public settings: ObsidianPluginSettings | undefined

  public async onload(): Promise<void> {
    document.body.classList.add('numbercruncher')
    await this.loadSettings()

    this.registerView(VIEW_TYPE_MAIN, (leaf) => new ObsidianMainView(leaf))
    this.addSettingTab(new ObsidianPluginSettingTab(this.app, this))

    // This creates an icon in the left ribbon.
    this.addRibbonIcon('dice', 'NumberCruncher', () => {
      // Called when the user clicks the icon.
      this.activateView()
    })

    new Notice('Numbercruncher loaded')
  }

  public onunload() {
    document.body.classList.remove('numbercruncher')
  }

  public async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  public async saveSettings() {
    await this.saveData(this.settings)
  }

  public async activateView() {
    const { workspace } = this.app

    let leaf: WorkspaceLeaf | null = null
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_MAIN)

    if (leaves.length > 0) {
      // A leaf with our view already exists, use that
      leaf = leaves[0]
    } else {
      // Our view could not be found in the workspace, create a new leaf in the main view
      leaf = workspace.getLeaf(true)
      if (!leaf) return
      await leaf.setViewState({ type: VIEW_TYPE_MAIN, active: true })
    }

    // "Reveal" the leaf
    workspace.revealLeaf(leaf)
  }
}
