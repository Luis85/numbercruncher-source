import { SystemRegistry } from '@/domains/GraphEditor/registry/SystemRegistry'
import { Scene } from 'excalibur'

export class BasicScene extends Scene {
  constructor(
    public id: string,
    public name: string,
    public systems: string[],
  ) {
    super()
    for (const systemConfig of systems) {
      const SystemClass = SystemRegistry[systemConfig]
      if (!SystemClass) continue
      this.world.add(SystemClass)
    }
  }
}
