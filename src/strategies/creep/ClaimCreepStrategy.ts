import CreepDecorator from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";
import RoomDecorator from "RoomDecorator";
import Strategy from "strategies/Strategy";

export default class ClaimCreepStrategy implements Strategy {
  get name() {
    return "claim";
  }

  constructor(
    private readonly creep:CreepDecorator,
    private readonly targetRoomName: string) {
  }

  tick() {
    var creep=this.creep;
    let controller = creep.creep.room.controller;
    let claimResult = creep.creep.claimController(controller);
    if(claimResult === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller);
    } else if(claimResult === ERR_INVALID_TARGET) {
      creep.creep.suicide();
    } else {
      throw new Error('Invalid claim result: ' + claimResult);
    }
  }
}
