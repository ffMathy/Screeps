import CreepDecorator from "CreepDecorator";
import ClaimCreepStrategy from "./ClaimCreepStrategy";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";

@profile
export default class ExploreCreepStrategy implements CreepStrategy {
  private target: RoomPosition;

  private fromRoomName: string;

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

      if(this.roomName === this.fromRoomName)
        return new ClaimCreepStrategy(creep);
    }

    if(this.fromRoomName !== creep.creep.room.name) {
      return new ClaimCreepStrategy(creep);
    }

    if(!this.target)
      throw new Error("No target exit from room " + this.fromRoomName + " to room " + this.roomName + " found.");
  }
}
