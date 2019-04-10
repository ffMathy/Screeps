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

    if(creep.creep.pos.x === this.target.x && creep.creep.pos.y === this.target.y) {
      console.log('reached destination', this.fromRoomName, creep.creep.room.name);
    }

    if(this.fromRoomName !== creep.creep.room.name) {
      console.log('switched room', this.fromRoomName, creep.creep.room.name);
      creep.updateRoom();
      return creep.setStrategy(new ClaimCreepStrategy(creep.creep.room.name));
    }

    creep.moveTo(this.target);
  }
}
