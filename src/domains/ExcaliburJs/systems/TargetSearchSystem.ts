import { Query, System, SystemType, TransformComponent, World } from 'excalibur'
import { TargetSearchComponent } from '../components/TargetSearchComponent'

export class TargetSearchSystem extends System {
  public priority = 99
  public systemType = SystemType.Update
  public query: Query<typeof TransformComponent | typeof TargetSearchComponent>

  constructor(world: World) {
    super()
    this.query = world.query([TransformComponent, TargetSearchComponent])
  }

  private _searchSpeed = 100

  public update(delta: number) {
    for (const entity of this.query.entities) {
      const target = entity.get(TargetSearchComponent).target
      const transform = entity.get(TransformComponent)
      const direction = target.sub(transform.pos)
      const motion = direction.normalize().scale(this._searchSpeed)
      // Moves these entities towards the target at 10 pixels per second
      transform.pos = transform.pos.add(motion.scale(delta / 1000))
    }
  }
}
