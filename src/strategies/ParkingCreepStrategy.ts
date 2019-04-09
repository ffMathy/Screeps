import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import rooms from "rooms";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class ParkingCreepStrategy implements CreepStrategy {
  private _tickCount: number;

  private readonly _parkPosition = { x: 5, y: 5 };

  get name() {
    return "park";
  }

  constructor() {
    this._tickCount = 0;
  }

  tick(creep: CreepDecorator) {
    this._tickCount++;

    if((this._tickCount % 15 === 0) || (this._parkPosition.x === creep.creep.pos.x && this._parkPosition.y === creep.creep.pos.y)) {
        return creep.setStrategy(new StrategyPickingCreepStrategy());
    }

    creep.creep.moveTo(new RoomPosition(this._parkPosition.x, this._parkPosition.y, rooms.mainRoom.room.name), { visualizePathStyle: { stroke: '#ffffff' }, range: 5 });
  }
}
