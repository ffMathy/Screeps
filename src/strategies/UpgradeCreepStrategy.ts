import CreepDecorator, { CreepStrategy } from "CreepDecorator";

export default class UpgradeCreepStrategy implements CreepStrategy {
  get name() {
    return "upgrade";
  }

  tick(creep: CreepDecorator) {
    if (creep.creep.upgradeController(creep.creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.creep.moveTo(creep.creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
}
