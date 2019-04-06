import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import Resources from "Resources";

export default class UpgradeCreepStrategy implements CreepStrategy {
  get name() {
    return "upgrade";
  }

  tick(creep: CreepDecorator) {
    Resources.instance.unreserve(creep);

    if (creep.creep.upgradeController(creep.creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.creep.moveTo(creep.creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
    }
  }
}
