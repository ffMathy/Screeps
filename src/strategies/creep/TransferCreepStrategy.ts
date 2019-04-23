import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";

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
      return null;

    var transferResult = creep.creep.transfer(this.availableTransferSites[0], RESOURCE_ENERGY);
    if (transferResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(this.availableTransferSites[0]);
    } else if(transferResult === OK) {
      return null;
    } else if(transferResult === ERR_FULL) {
      return null;
    } else {
      throw new Error('Invalid transfer result: ' + transferResult);
    }
  }
}
