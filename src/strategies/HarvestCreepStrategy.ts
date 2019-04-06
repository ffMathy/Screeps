import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import Resources from "Resources";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class HarvestCreepStrategy implements CreepStrategy {
  get name() {
    return "harvest";
  }

  tick(creep: CreepDecorator) {
    if(creep.creep.carry.energy == creep.creep.carryCapacity)
      return creep.setStrategy(new StrategyPickingCreepStrategy());

    let sources = creep.room.sources;
    let reservedId = creep.memory.reservationId;
    let reservedSource: Source = null;
    if(reservedId) {
      reservedSource = sources.filter(x => x.id === reservedId)[0];
    }

    if(!reservedSource) {
      for (let source of sources) {
        if(!Resources.instance.reserve(creep, source.id))
          continue;

        reservedSource = source;
        break;
      }
    }

    if (reservedSource) {
      if(creep.creep.harvest(reservedSource) === ERR_NOT_IN_RANGE) {
        creep.creep.moveTo(reservedSource, { visualizePathStyle: { stroke: '#ffffff' }});
      }
    } else {
      //TODO: handle withdrawal from extension.
      creep.setStrategy(new StrategyPickingCreepStrategy());
    }
  }
}
