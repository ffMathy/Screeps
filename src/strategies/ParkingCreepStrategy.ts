import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import rooms from "rooms";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class ParkingCreepStrategy implements CreepStrategy {
  private _tickCount: number;

  get name() {
    return "park";
  }

  constructor() {
    this._tickCount = 0;
  }

  tick(creep: CreepDecorator) {
    this._tickCount++;

    if((this._tickCount % 15 === 0) || (16 === creep.creep.pos.x && 13 === creep.creep.pos.y)) {
        return creep.setStrategy(new StrategyPickingCreepStrategy());
    }

    creep.creep.moveTo(new RoomPosition(16, 13, rooms.mainRoom.room.name), { visualizePathStyle: { stroke: '#ffffff' } });
  }
}
