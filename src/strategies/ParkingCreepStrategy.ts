import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import rooms from "rooms";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";
import Resources from "Resources";

export default class ParkingCreepStrategy implements CreepStrategy {
  private lastPosition: RoomPosition;

  get name() {
    return "park";
  }

  tick(creep: CreepDecorator) {
    Resources.instance.unreserve(creep);

    if(this.lastPosition) {
      if(this.lastPosition.x === creep.creep.pos.x && this.lastPosition.y === creep.creep.pos.y)
        return creep.setStrategy(new StrategyPickingCreepStrategy());
    }

    creep.creep.moveTo(new RoomPosition(16, 13, rooms.mainRoom.room.name), { visualizePathStyle: { stroke: '#ffffff' } });
    this.lastPosition = {...creep.creep.pos};
  }
}
