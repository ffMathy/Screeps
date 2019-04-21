import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";
import RoomDecorator from "RoomDecorator";

export default class ClaimCreepStrategy implements CreepStrategy {
  get name() {
    return "claim";
  }

  constructor(
    private readonly previousRoom: RoomDecorator,
    private readonly targetRoomName: string) {
  }

  tick(creep: CreepDecorator) {
    let controller = creep.creep.room.controller;
    if(!controller) {
      this.previousRoom.unexploredNeighbourNames.splice(this.previousRoom.unexploredNeighbourNames.indexOf(this.targetRoomName), 1);
    } else {
      let claimResult = creep.creep.claimController(controller);
      if(claimResult === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller);
      } else {
        this.previousRoom.detectNeighbours();
        creep.setStrategy(new StrategyPickingCreepStrategy());
      }
    }
  }
}
