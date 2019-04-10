import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class ParkingCreepStrategy implements CreepStrategy {
  private readonly _parkPosition = { x: 25, y: 25 };
  
  private _lastPosition: RoomPosition = null;
  private _impedimentCount: number;

  get name() {
    return "park" + (this.targetRoomName ? (' ' + this.targetRoomName) : '');
  }

  constructor(
    private readonly targetRoomName?: string) {

      this._impedimentCount = 0;
  }

  tick(creep: CreepDecorator) {
    let targetRoomName = this.targetRoomName || creep.creep.room.name;

    let isImpeded = this._lastPosition && this._lastPosition.x === creep.creep.pos.x && this._lastPosition.y === creep.creep.pos.y;
    if(isImpeded) {
      this._impedimentCount++;
    } else {
      this._impedimentCount = 0;
    }

    if(this._impedimentCount > 5 || (creep.creep.room.name === targetRoomName && creep.creep.pos.x === this._parkPosition.x && creep.creep.pos.y === this._parkPosition.y)) {
        return creep.setStrategy(new StrategyPickingCreepStrategy());
    }

    this._lastPosition = creep.creep.pos;
    creep.moveTo(new RoomPosition(this._parkPosition.x, this._parkPosition.y, targetRoomName), { ignoreCreeps: true });
  }
}
