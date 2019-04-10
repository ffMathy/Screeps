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
    creep.moveTo(new RoomPosition(25, 25, this.targetRoomName), { range: 10, ignoreCreeps: true });

    let controller = creep.creep.room.controller;
    if(!controller) {
      this.previousRoom.unexploredNeighbourNames.splice(this.previousRoom.unexploredNeighbourNames.indexOf(this.targetRoomName), 1);
    } else {
      if(creep.creep.claimController(controller) === ERR_NOT_IN_RANGE) {
        creep.moveTo(controller);
      } else {
        creep.setStrategy(new StrategyPickingCreepStrategy());
      }
    }
  }
}
