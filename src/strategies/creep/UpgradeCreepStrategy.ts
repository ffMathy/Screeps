import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";

@profile
export default class UpgradeCreepStrategy implements CreepStrategy {
  get name() {
    return "upgrade";
  }

  constructor(
    private readonly creep: CreepDecorator) {
  }

  tick() {
    let creep = this.creep;
    if(creep.creep.carry.energy == 0)
      return null;

    //TODO: claim controller if level 0
    let upgradeResult = creep.creep.upgradeController(creep.creep.room.controller);
    if (upgradeResult !== OK) {
      throw new Error('Upgrade error: ' + upgradeResult);
    }
  }
}
