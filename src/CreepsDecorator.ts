import CreepDecorator from 'CreepDecorator';
import GameDecorator from 'GameDecorator';

export default class CreepsDecorator {
  public all: CreepDecorator[];

  constructor(game: GameDecorator) {
    this.all = [];

    for (let creepName in game.game.creeps) {
      let creep = game.game.creeps[creepName];
      this.all.push(new CreepDecorator(game, creep));
    }
  }

  tick() {
    for (let creep of this.all) {
      creep.tick();
    }
  }
}
