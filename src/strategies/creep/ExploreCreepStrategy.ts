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
    }

    if(!this.target)
      return creep.setStrategy(new ParkingCreepStrategy(creep));

    if(this.fromRoomName !== creep.creep.room.name) {
      creep.moveTo(creep.creep.room.controller);
      creep.setStrategy(new ClaimCreepStrategy(
        creep,
        this.fromRoom,
        creep.creep.room.name));
      return;
    }

    creep.moveTo(this.target);
  }
}
