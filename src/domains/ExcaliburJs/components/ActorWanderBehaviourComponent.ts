import { Component, vec, Vector } from 'excalibur'

export class ActorWanderBehaviourComponent extends Component {
  /** Aktuelles Ziel */
  public target: Vector
  /** Maximaler Radius um den Startpunkt */
  public radius: number
  /** Laufgeschwindigkeit in Pixel/Sekunde */
  public speed: number
  /** Min/Max Wartezeit nach Ankunft (Sekunden) */
  public waitRange: [number, number]
  /** Verstrichene Wartezeit */
  public waitTimer: number
  /** Zu wartende Dauer (Sekunden) */
  public waitDuration: number

  constructor(radius: number = 200, speed: number = 60, waitRange: [number, number] = [0.5, 2]) {
    super()
    this.radius = radius
    this.speed = speed
    this.waitRange = waitRange
    this.waitTimer = 0
    this.waitDuration = 0
    // initialisieren mit gleichem Punkt, damit das System gleich beim ersten Update ein neues Ziel wählt
    this.target = vec(0, 0)
  }
}
