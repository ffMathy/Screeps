import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class UpgradeCreepStrategy implements CreepStrategy {
  get name() {
    return "upgrade";
  }

  tick(creep: CreepDecorator) {
    if(creep.creep.carry.energy == 0)
      return creep.setStrategy(new StrategyPickingCreepStrategy());

    //TODO: claim controller if level 0
    if (creep.creep.upgradeController(creep.creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.creep.room.controller);
    }
  }
}
