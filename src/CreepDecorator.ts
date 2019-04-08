import rooms from 'rooms';
import RoomDecorator from 'RoomDecorator';
import StrategyPickingCreepStrategy from 'strategies/StrategyPickingCreepStrategy';

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

  constructor(public creep: Creep) {
    this.room = rooms.getCreepRoom(creep);

    this.strategy = new StrategyPickingCreepStrategy();
  }

  setStrategy(strategy: CreepStrategy) {
    this.strategy = strategy;
    this.tick();
  }

  tick() {
    if(this.creep)
      this.creep = Game.creeps[this.creep.name];
      
    if(!this.creep || this.creep.ticksToLive <= 3) {
      console.log('creep needing cleanup.', this.creep.id);
      (Game.cpu as any).halt();
      return;
    }

    this.creep.say(this.strategy.name);
    this.strategy.tick(this);
  }
}
