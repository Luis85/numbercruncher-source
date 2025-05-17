import { rngInt } from '@/utils/rngInt'
import { Query, System, SystemType, vec, World, Scene, Actor, Color } from 'excalibur'
import { CreatureComponent } from '../components/CreatureComponent'
import { rngFloat } from '@/utils/rngFloat'

export class EvolutionSimulationSystem extends System {
  public priority = 99
  public systemType = SystemType.Update
  public query: Query< typeof CreatureComponent >

  private scene?: Scene
  private environment?: Actor

  private worldWidth = 600
  private worldHeight = 400
  private populationSize = 50

  constructor(world: World) {
    super()
    this.query = world.query([CreatureComponent])
  }

  public initialize(world: World, scene: Scene): void {
    this.scene = scene
    this.environment = new Actor({
      name: 'Environment',
      width: this.worldWidth,
      height: this.worldHeight,
      color: Color.Green,
      anchor: vec(0,0),
      x: 100,
      y: 100,
    })
    this.environment.addTag('Environment')
    this.scene.add(this.environment)
  }

  public update() {

    // 1) Spawning
    const birthChance = 0.8
    if (rngFloat(0, 1) <= birthChance) this.spawnCreature()

    // 2) Culling
    for (const entity of this.query.entities) {
      if(entity.isKilled()) {
        this.environment?.removeChild(entity)
        continue
      }
      const creature = entity.get(CreatureComponent)!
      if (rngFloat(0, 1) <= creature.deathChance) {
        entity.kill()
      }
    }
  }

  private spawnCreature() {
    if(!this.scene || !this.environment) return
    const creature = new Actor({
      //name: `Creature #${this.scene.actors.length}${rngFloat(0,1)}`,
      x: rngInt(0, this.worldWidth),
      y: rngInt(0, this.worldHeight),
      width: rngInt(5, 15),
      height: rngInt(15, 35),
      color: Color.ExcaliburBlue,
    })
    creature.addTag('Population')
    creature.addComponent(new CreatureComponent())
    this.environment.addChild(creature)
  }
}
