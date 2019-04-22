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
    private readonly previousRoom: RoomDecorator,
    private readonly targetRoomName: string) {
  }

  tick() {
    var creep=this.creep;
    let controller = creep.creep.room.controller;
    if(!controller) {
      this.previousRoom.unexploredNeighbourNames.splice(this.previousRoom.unexploredNeighbourNames.indexOf(this.targetRoomName), 1);
    } else {
      let claimResult = creep.creep.claimController(controller);
      if(claimResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller);
      } else {
        this.previousRoom.detectNeighbours();
        creep.setStrategy(new StrategyPickingCreepStrategy(creep));
      }
    }
  }
}
