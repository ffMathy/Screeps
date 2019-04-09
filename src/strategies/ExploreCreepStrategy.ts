import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import ParkingCreepStrategy from "./ParkingCreepStrategy";

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
      if(this.fromRoomName !== creep.creep.room.name) {
        creep.updateRoom();
        return creep.setStrategy(new ParkingCreepStrategy());
      }
    }

    creep.moveTo(this.target);
  }
}
