import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import ParkingCreepStrategy from "./ParkingCreepStrategy";
import ClaimCreepStrategy from "./ClaimCreepStrategy";
import RoomDecorator from "RoomDecorator";

export default class ExploreCreepStrategy implements CreepStrategy {
  private target: RoomPosition;

  private fromRoomName: string;
  private fromRoom: RoomDecorator;

  get name() {
    return "explore";
  }

  constructor(
    private readonly roomName: string)
  {
  }

  tick(creep: CreepDecorator) {
    if(!this.target) {
      this.target = creep.creep.pos.findClosestByPath(creep.creep.room.findExitTo(this.roomName));
      this.fromRoomName = creep.creep.room.name;
      this.fromRoom = creep.room;
    }

    if(!this.target)
      return creep.setStrategy(new ParkingCreepStrategy());

    if(this.fromRoomName !== creep.creep.room.name) {
      creep.moveTo(creep.creep.room.controller);
      creep.setStrategy(new ClaimCreepStrategy(
        this.fromRoom,
        creep.creep.room.name));
      return;
    }

    creep.moveTo(this.target);
  }
}
