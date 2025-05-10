import { Actor, Color, Scene, type ActorArgs } from 'excalibur'

export class PlaygroundScene extends Scene {
  public onInitialize() {
    const playerActor: ActorArgs = {
      name: 'Player Actor',
      width: 25,
      height: 25,
      color: Color.ExcaliburBlue,
    }

    const enemyActor: ActorArgs = {
      name: 'Enemy Actor',
      width: 25,
      height: 25,
      color: Color.Red,
    }

    const player = new Actor(playerActor)
    const enemy = new Actor(enemyActor)

    player.actions.repeatForever((ctx) => {
      ctx
        .moveTo(500, 150, 1200)
        .delay(1000)
        .moveTo(100, 300, 1500)
        .delay(1000)
        .moveTo(200, 500, 1500)
        .delay(800)
    })

    enemy.actions.repeatForever((ctx) => {
      ctx
        .moveTo(100, 350, 600)
        .delay(1000)
        .moveTo(200, 100, 200)
        .delay(1000)
        .moveTo(340, 500, 1100)
        .delay(800)
    })

    this.add(player)
    this.add(enemy)
  }
}
