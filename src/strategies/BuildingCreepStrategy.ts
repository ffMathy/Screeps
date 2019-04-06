import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class BuildingCreepStrategy implements CreepStrategy {
  get name() {
    return "build";
  }

  tick(creep: CreepDecorator) {
    if(creep.creep.carry.energy === 0)
      return creep.setStrategy(new StrategyPickingCreepStrategy());

    var targets = creep.creep.room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length > 0) {
      if (creep.creep.build(targets[0] as ConstructionSite) == ERR_NOT_IN_RANGE) {
        creep.creep.moveTo(targets[0] as ConstructionSite, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    } else {
      return creep.setStrategy(new StrategyPickingCreepStrategy());
    }
  }

}
