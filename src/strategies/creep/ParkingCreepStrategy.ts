import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";

export default class ParkingCreepStrategy implements CreepStrategy {
  private readonly _parkPosition = { x: 25, y: 25 };

  get name() {
    return "park" + (this.targetRoomName ? (' ' + this.targetRoomName) : '');
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly targetRoomName?: string)
  {
  }

  tick() {
    let creep = this.creep;
    let targetRoomName = this.targetRoomName || creep.creep.room.name;

    let isCloseEnough = Math.abs(creep.creep.pos.x - this._parkPosition.x) < 3 && Math.abs(creep.creep.pos.y - this._parkPosition.y) < 3;
    if(creep.creep.room.name === targetRoomName && isCloseEnough) {
        return;
    }

    creep.moveTo(new RoomPosition(this._parkPosition.x, this._parkPosition.y, targetRoomName));
    return void 0;
  }
}
