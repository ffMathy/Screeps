import CreepDecorator from 'CreepDecorator';
import GameDecorator from 'GameDecorator';

export default class CreepsDecorator {
  public all: CreepDecorator[];

  constructor(private readonly game: GameDecorator) {
    this.all = [];
  }

  initialize() {
    for (let creepName in this.game.game.creeps) {
      let creep = this.game.game.creeps[creepName];
      this.all.push(new CreepDecorator(this.game, creep));
    }
  }

  tick() {
    for (let creep of this.all) {
      creep.tick();
    }
  }
}
