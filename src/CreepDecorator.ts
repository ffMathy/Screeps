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
  public room: RoomDecorator;

  private strategy: CreepStrategy;
  private lastStrategyTick: number;

  public get memory(): CreepMemory {
    return this.creep.memory;
  }

  constructor(
    private readonly game: GameDecorator,
    public creep: Creep)
  {
    for(let key in creep.memory)
      delete creep.memory[key];

    this.room = game.rooms.fromCreep(creep);
    this.strategy = new StrategyPickingCreepStrategy();
  }

  moveTo(target: RoomPosition | { pos: RoomPosition; }, opts?: MoveToOpts) {
    if(!opts)
      opts = {};

    opts.visualizePathStyle = { stroke: '#ffffff' };

    // let game = GameDecorator.instance;
    opts.reusePath = 10; //game.usedCpu < game.availableCpu / 2 ? 25 : 1;

    return this.creep.moveTo(target, opts);
  }

  setStrategy(strategy: CreepStrategy) {
    this.strategy = strategy;
    this.lastStrategyTick = this.game.tickCount;
  }

  updateRoom() {
    this.room.removeCreep(this);
    this.room = this.game.rooms.fromCreep(this.creep);
    this.room.addCreep(this);
  }

  tick() {
    const oldCreep = this.creep;
    if(this.creep)
      this.creep = Game.creeps[this.creep.name];

    if(!this.creep || oldCreep.ticksToLive <= 3) {
      this.game.resources.unreserve(oldCreep);
      this.game.creeps.remove(this);
      return;
    }

    if(this.creep.room.name !== oldCreep.room.name) {
      this.updateRoom();
    }

    let strategyTickDifference = this.game.tickCount - this.lastStrategyTick;
    if(strategyTickDifference < 10)
      this.creep.say(this.strategy.name, true);

    this.strategy.tick(this);
  }
}
