import CreepDecorator from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class TransferCreepStrategy implements CreepStrategy {
  get name() {
    return "transfer";
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly availableTransferSites: Structure[]
  ) {

  }

  tick() {
    let creep = this.creep;
    if(creep.creep.carry.energy == 0)
      return creep.setStrategy(new StrategyPickingCreepStrategy(creep));

    var transferResult = creep.creep.transfer(this.availableTransferSites[0], RESOURCE_ENERGY);
    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(this.availableTransferSites[0]);
    } else if(transferResult !== OK) {
      creep.setStrategy(new StrategyPickingCreepStrategy(creep));
    }
  }
}
