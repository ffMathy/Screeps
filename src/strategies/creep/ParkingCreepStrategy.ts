import CreepDecorator from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";
import Strategy from "strategies/Strategy";

export default class ParkingCreepStrategy implements Strategy {
  private readonly _parkPosition = { x: 25, y: 25 };

  private _lastPosition: RoomPosition = null;
  private _impedimentCount: number;

  get name() {
    return "park" + (this.targetRoomName ? (' ' + this.targetRoomName) : '');
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly targetRoomName?: string) {

      this._impedimentCount = 0;
  }

  tick() {
    let creep = this.creep;
    let targetRoomName = this.targetRoomName || creep.creep.room.name;

    let isImpeded = this._lastPosition && this._lastPosition.x === creep.creep.pos.x && this._lastPosition.y === creep.creep.pos.y;
    if(isImpeded) {
      this._impedimentCount++;
    } else {
      this._impedimentCount = 0;
    }

    if(creep.creep.room.name === targetRoomName && creep.creep.pos.x === this._parkPosition.x && creep.creep.pos.y === this._parkPosition.y) {
        return creep.setStrategy(new StrategyPickingCreepStrategy(creep));
    }

    if(this._impedimentCount > 30) {
      if(creep.room.isPopulationMaintained) {
        let neighbourWithLowPopulation = creep.room.neighbours.find(x => x.room && x.room.controller && x.room.controller.my && !x.isPopulationMaintained);
        if(neighbourWithLowPopulation)
          return creep.setStrategy(new ParkingCreepStrategy(creep, neighbourWithLowPopulation.room.name));
      }

      return creep.setStrategy(new StrategyPickingCreepStrategy(creep));
    }

    this._lastPosition = creep.creep.pos;
    creep.moveTo(new RoomPosition(this._parkPosition.x, this._parkPosition.y, targetRoomName));
  }
}
