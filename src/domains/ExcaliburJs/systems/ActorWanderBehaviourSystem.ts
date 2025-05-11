import {
  MotionComponent,
  Query,
  System,
  SystemType,
  TransformComponent,
  vec,
  Vector,
  World,
} from 'excalibur'
import { ActorWanderBehaviourComponent } from '../components/ActorWanderBehaviourComponent'

export class ActorWanderBehaviourSystem extends System {
  public priority = 99
  public systemType = SystemType.Update
  public query: Query<
    typeof TransformComponent | typeof MotionComponent | typeof ActorWanderBehaviourComponent
  >

  private worldWidth: number = 400
  private worldHeight: number = 400

  constructor(world: World) {
    super()
    this.query = world.query([TransformComponent, MotionComponent, ActorWanderBehaviourComponent])
  }

  public update(delta: number) {
    const deltaSec = delta / 1000
    for (const entity of this.query.entities) {
      const transform = entity.get(TransformComponent)
      const motion = entity.get(MotionComponent)
      const behaviour = entity.get(ActorWanderBehaviourComponent)

      // Wenn keine Ziel- und Wartezeit gesetzt sind, neues Ziel auswählen
      if (behaviour.waitDuration === 0) {
        this.setNewTarget(behaviour, transform.pos)
      }

      const distance = transform.pos.distance(behaviour.target)

      // Ziel erreicht?
      if (distance < 4) {
        // anhalten
        motion.vel = vec(0, 0)
        // Wartezeit erhöhen
        behaviour.waitTimer += deltaSec
        if (behaviour.waitTimer >= behaviour.waitDuration) {
          // Reset, damit nächster Durchlauf neues Ziel auswählt
          behaviour.waitTimer = 0
          behaviour.waitDuration = 0
        }
      } else {
        // noch unterwegs: Richtung berechnen & Geschwindigkeit setzen
        const dir = behaviour.target.sub(transform.pos).normalize()
        motion.vel = dir.scale(behaviour.speed)
      }
    }
  }

  private setNewTarget(behaviour: ActorWanderBehaviourComponent, origin: Vector) {
    // zufälligen Winkel & Offset im Radius wählen
    const angle = Math.random() * Math.PI * 2
    const offset = vec(Math.cos(angle) * behaviour.radius, Math.sin(angle) * behaviour.radius)
    const candidate = origin.add(offset)
    // Clamp an Welt-/Szenengrenzen
    candidate.x = Math.max(0, Math.min(this.worldWidth, candidate.x))
    candidate.y = Math.max(0, Math.min(this.worldHeight, candidate.y))

    behaviour.target = candidate
    // zufällige Wartezeit in Range
    const [minW, maxW] = behaviour.waitRange
    behaviour.waitDuration = Math.random() * (maxW - minW) + minW
    behaviour.waitTimer = 0
  }
}
