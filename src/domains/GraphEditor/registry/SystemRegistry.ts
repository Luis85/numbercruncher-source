import type { System, World } from 'excalibur'
import { TargetSearchSystem } from '@/domains/ExcaliburJs/systems/TargetSearchSystem'
import { ActorWanderBehaviourSystem } from '@/domains/ExcaliburJs/systems/ActorWanderBehaviourSystem'

type SystemConstructor = new (world: World) => System

export const SystemRegistry: Record<string, SystemConstructor> = {
  TargetSearchSystem,
  ActorWanderBehaviourSystem,
}
