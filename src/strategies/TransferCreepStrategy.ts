import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class TransferCreepStrategy implements CreepStrategy {
  get name() {
    return "transfer";
  }

  constructor(
    private readonly availableTransferSites: Structure[]
  ) {

  }

  tick(creep: CreepDecorator) {
    if(creep.creep.carry.energy == 0)
      return creep.setStrategy(new StrategyPickingCreepStrategy());

    var transferResult = creep.creep.transfer(this.availableTransferSites[0], RESOURCE_ENERGY);
    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(this.availableTransferSites[0], {ignoreCreeps: true});
    }
  }
}
