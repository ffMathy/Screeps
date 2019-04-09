import RoomDecorator from 'RoomDecorator';
import StrategyPickingCreepStrategy from 'strategies/StrategyPickingCreepStrategy';
import GameDecorator from 'GameDecorator';

export interface CreepMemory {
  reservationId: string;
}

export interface CreepStrategy {
  readonly name: string;

  tick(creep: CreepDecorator);
}

export default class CreepDecorator {
  public readonly room: RoomDecorator;

  private strategy: CreepStrategy;

  public get memory(): CreepMemory {
    return this.creep.memory;
  }

  constructor(
    private readonly game: GameDecorator,
    public creep: Creep)
  {
    this.room = game.rooms.fromCreep(creep);
    this.strategy = new StrategyPickingCreepStrategy();
  }

  moveTo(target: RoomPosition | { pos: RoomPosition; }, opts?: MoveToOpts) {
    if(!opts)
      opts = {};

    opts.visualizePathStyle = { stroke: '#ffffff' };

    let game = GameDecorator.instance;
    opts.reusePath = game.usedCpu < game.availableCpu / 1.25 ? 25 : 1;

    this.creep.moveTo(target, opts);
  }

  setStrategy(strategy: CreepStrategy) {
    this.strategy = strategy;
  }

  tick() {
    if(this.creep)
      this.creep = Game.creeps[this.creep.name];

    if(!this.creep || this.creep.ticksToLive <= 3) {
      this.game.creeps.all.splice(this.game.creeps.all.indexOf(this), 1);
      return;
    }

    this.creep.say(this.strategy.name);
    this.strategy.tick(this);
  }
}
