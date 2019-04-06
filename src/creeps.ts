import CreepDecorator from 'CreepDecorator';

class Creeps {
  public all: CreepDecorator[];

  constructor() {
    this.all = [];

    for (let creepName in Game.creeps) {
      let creep = Game.creeps[creepName];
      this.all.push(new CreepDecorator(creep));
    }
  }

  tick() {
    for (let creep of this.all) {
      creep.tick();
    }
  }
}

export default new Creeps();
