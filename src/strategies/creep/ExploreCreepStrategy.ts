import CreepDecorator from "CreepDecorator";
import ParkingCreepStrategy from "./ParkingCreepStrategy";
import ClaimCreepStrategy from "./ClaimCreepStrategy";
import RoomDecorator from "RoomDecorator";
import Strategy from "strategies/Strategy";

export default class ExploreCreepStrategy implements Strategy {
  private target: RoomPosition;

  private fromRoomName: string;
  private fromRoom: RoomDecorator;

  get name() {
    return "explore";
  }

  constructor(
    private readonly creep:CreepDecorator,
    private readonly roomName: string)
  {
  }

  tick() {
    var creep=this.creep;
    if(!this.target) {
      this.target = creep.creep.pos.findClosestByPath(creep.creep.room.findExitTo(this.roomName));
      this.fromRoomName = creep.creep.room.name;
      this.fromRoom = creep.room;

      if(this.roomName === this.fromRoomName)
        return creep.setStrategy(new ClaimCreepStrategy(
          creep,
          this.roomName));
    }

    if(this.fromRoomName !== creep.creep.room.name) {
      creep.moveTo(creep.creep.room.controller);
      return creep.setStrategy(new ClaimCreepStrategy(
        creep,
        creep.creep.room.name));
    }

    if(!this.target)
      throw new Error("No target exit from room " + this.fromRoomName + " to room " + this.roomName + " found.");

    creep.moveTo(this.target);
  }
}
