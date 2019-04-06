import rooms from 'rooms';
import Resources from 'Resources';
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

  build() {
    var targets = this.creep.room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length) {
      if (this.creep.build(targets[0] as ConstructionSite) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(targets[0] as ConstructionSite, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }

  park() {
    this.creep.moveTo(16, 13, { visualizePathStyle: { stroke: '#ffffff' } });
  }

  transferEnergy() {
    let targets = rooms.getCreepRoom(this.creep).getTransferrableStructures();
    if (targets.length > 0) {
      var transferResult = this.creep.transfer(targets[0], RESOURCE_ENERGY);
      if (transferResult === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
      }
    } else {
      this.park();
    }
  }

  upgradeController() {
    if (this.creep.upgradeController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
      this.creep.moveTo(this.creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }

  harvestSource() {
    let sources = this.room.sources;
    let reservedSource: Source = null;
    for (let source of sources) {
      if(!Resources.instance.reserve(this, source.id))
        continue;

      reservedSource = source;
      break;
    }

    if (reservedSource) {
      this.creep.say('🔄' + reservedSource.id.substring(reservedSource.id.length - 5));
      if(this.creep.harvest(reservedSource) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(reservedSource);
      }
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
