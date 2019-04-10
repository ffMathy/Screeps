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

  remove(creep: CreepDecorator) {
    if(this.all.indexOf(creep) > -1)
      this.all.splice(this.all.indexOf(creep), 1);

    creep.room.removeCreep(creep);
  }

  add(creep: CreepDecorator) {
    creep.room.addCreep(creep);

    if(this.all.indexOf(creep) === -1)
      this.all.push(creep);
  }

  tick() {
    for (let creep of this.all) {
      creep.tick();
    }
  }
}
