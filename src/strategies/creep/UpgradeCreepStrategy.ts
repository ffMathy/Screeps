import CreepDecorator from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";
import Strategy from "strategies/Strategy";

export default class UpgradeCreepStrategy implements Strategy {
  get name() {
    return "upgrade";
  }

  constructor(
    private readonly creep: CreepDecorator) {
  }

  tick() {
    let creep = this.creep;
    if(creep.creep.carry.energy == 0)
      return creep.setStrategy(new StrategyPickingCreepStrategy(creep));

    //TODO: claim controller if level 0
    if (creep.creep.upgradeController(creep.creep.room.controller) == ERR_NOT_IN_RANGE) {
      creep.moveTo(creep.creep.room.controller);
    }
  }
}