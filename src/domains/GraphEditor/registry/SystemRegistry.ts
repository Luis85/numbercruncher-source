import type { System, World } from 'excalibur'
import { TargetSearchSystem } from '@/domains/ExcaliburJs/systems/TargetSearchSystem'
import { ActorWanderBehaviourSystem } from '@/domains/ExcaliburJs/systems/ActorWanderBehaviourSystem'
import { EvolutionSimulationSystem } from '@/domains/ExcaliburJs/systems/EvolutionSimulationSystem'

type SystemConstructor = new (world: World) => System

export const SystemRegistry: Record<string, SystemConstructor> = {
  TargetSearchSystem,
  ActorWanderBehaviourSystem,
  EvolutionSimulationSystem,
}
