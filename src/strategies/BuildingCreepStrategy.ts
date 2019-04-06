import CreepDecorator, { CreepStrategy } from "CreepDecorator";

export default class BuildingCreepStrategy implements CreepStrategy {
  get name() {
    return "build";
  }

  tick(creep: CreepDecorator) {
    var targets = creep.creep.room.find(FIND_CONSTRUCTION_SITES);
    if (targets.length) {
      if (creep.creep.build(targets[0] as ConstructionSite) == ERR_NOT_IN_RANGE) {
        creep.creep.moveTo(targets[0] as ConstructionSite, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
  }

}
