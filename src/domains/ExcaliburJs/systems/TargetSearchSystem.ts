import { Query, System, SystemType, TransformComponent, Vector, World } from 'excalibur'
import { TargetSearchComponent } from '../components/TargetSearchComponent'

export class TargetSearchSystem extends System {
  public priority = 99
  public systemType = SystemType.Update
  public query: Query<
    typeof TransformComponent |
    typeof TargetSearchComponent
  >

  private readonly _searchSpeed = 100;
  /** Abstand in Pixel, ab dem das Ziel als erreicht gilt */
  private readonly _arrivalThreshold = 4;

  constructor(world: World) {
    super()
    this.query = world.query([
      TransformComponent,
      TargetSearchComponent
    ])
  }

  public update(delta: number) {
    const deltaSec = delta / 1000;
    for (const entity of this.query.entities) {
      const behaviour = entity.get(TargetSearchComponent);
      const transform = entity.get(TransformComponent);
      const target = behaviour.target;

      // Vektor zum Ziel und Distanz ermitteln
      const toTarget: Vector = target.sub(transform.pos);
      const distance = toTarget.magnitude;

      if (distance > this._arrivalThreshold) {
        // Bewegen, solange Ziel nicht erreicht
        const motion = toTarget.normalize().scale(this._searchSpeed);
        transform.pos = transform.pos.add(motion.scale(deltaSec));
      } else {
        // target reached
        // remove component to stop searching
        entity.removeComponent(TargetSearchComponent)
      }
    }
  }
}
