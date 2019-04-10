import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import ParkingCreepStrategy from "./ParkingCreepStrategy";
import ClaimCreepStrategy from "./ClaimCreepStrategy";

export default class ExploreCreepStrategy implements CreepStrategy {
  private target: RoomPosition;
  private fromRoomName: string;

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
    }

    if(!this.target)
      return creep.setStrategy(new ParkingCreepStrategy());

    if(this.fromRoomName !== creep.creep.room.name) {
      let oldRoom = creep.room;
      creep.updateRoom();
      creep.setStrategy(new ClaimCreepStrategy(
        oldRoom,
        creep.creep.room.name));
      return;
    }

    creep.moveTo(this.target);
  }
}
