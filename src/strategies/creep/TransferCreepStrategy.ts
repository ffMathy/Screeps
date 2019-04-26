import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";

@profile
export default class TransferCreepStrategy implements CreepStrategy {
  get name() {
    return "transfer";
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly targetId: string
  ) {

  }

  tick() {
    let creep = this.creep;
    if(creep.creep.carry.energy == 0)
      return null;

    var transferResult = creep.creep.transfer(Game.getObjectById(this.targetId), RESOURCE_ENERGY);
    if(transferResult === OK) {
      return;
    } else if(transferResult === ERR_FULL) {
      return null;
    } else {
      throw new Error('Invalid transfer result: ' + transferResult);
    }
  }
}
