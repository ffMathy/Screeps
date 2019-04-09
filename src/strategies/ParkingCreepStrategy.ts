import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class ParkingCreepStrategy implements CreepStrategy {
  private _tickCount: number;

  private readonly _parkPosition = { x: 25, y: 25 };

  get name() {
    return "park";
  }

  constructor() {
    this._tickCount = 0;
  }

  tick(creep: CreepDecorator) {
    this._tickCount++;

    if((this._tickCount % 3 === 0)) {
        return creep.setStrategy(new StrategyPickingCreepStrategy());
    }

    creep.moveTo(new RoomPosition(this._parkPosition.x, this._parkPosition.y, creep.room.room.name), { range: 3 });
  }
}
