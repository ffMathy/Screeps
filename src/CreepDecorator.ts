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
  public readonly memory: CreepMemory;
  public readonly room: RoomDecorator;

  private strategy: CreepStrategy;

  constructor(public creep: Creep) {
    this.memory = creep.memory;
    this.room = rooms.getCreepRoom(creep);

    this.strategy = new StrategyPickingCreepStrategy();
  }

  park() {
    this.creep.moveTo(16, 13, { visualizePathStyle: { stroke: '#ffffff' } });
  }

  upgradeController() {
    if (this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(this.creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }

  setStrategy(strategy: CreepStrategy) {
    this.strategy = strategy;
  }

  tick() {
    this.creep.say(this.strategy.name);
    this.strategy.tick(this);
  }
}
