import { Component } from 'excalibur'

export class CreatureComponent extends Component {
  constructor(
    public birthChance: number = 1,
    public deathChance: number = 0.1,
    public size: number = 1,
    public sense: number = 40,
    public speed: number = 160,
  ) {
    super()
  }
}
