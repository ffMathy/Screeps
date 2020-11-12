import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";



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

      let upgradeResult = creep.creep.room.controller.level === 0 ?
        creep.creep.claimController(creep.creep.room.controller) :
        creep.creep.upgradeController(creep.creep.room.controller);
      if(upgradeResult === ERR_NOT_IN_RANGE)
        throw new Error("Could not upgrade or claim: not in range");

      if (upgradeResult !== OK) {
        throw new Error('Upgrade error: ' + upgradeResult);
      }
  }
}
