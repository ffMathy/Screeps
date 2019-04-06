import CreepDecorator, { CreepStrategy } from "CreepDecorator";

export default class UpgradeCreepStrategy implements CreepStrategy {
  get name() {
    return "upgrade";
  }

  tick(creep: CreepDecorator) {
    creep.upgradeController();
  }
}
