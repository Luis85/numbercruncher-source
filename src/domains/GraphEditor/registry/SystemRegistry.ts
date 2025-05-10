import type { System, World } from 'excalibur'
import { TargetSearchSystem } from '@/domains/ExcaliburJs/systems/TargetSearchSystem'

type SystemConstructor = new (world: World) => System

export const SystemRegistry: Record<string, SystemConstructor> = {
  TargetSearchSystem,
}
