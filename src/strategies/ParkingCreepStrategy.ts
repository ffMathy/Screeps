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

    if(16 === creep.creep.pos.x && 13 === creep.creep.pos.y) {
        return creep.setStrategy(new StrategyPickingCreepStrategy());
    }

    creep.creep.moveTo(new RoomPosition(16, 13, rooms.mainRoom.room.name), { visualizePathStyle: { stroke: '#ffffff' } });
    this.lastPosition = {...creep.creep.pos};
  }
}
