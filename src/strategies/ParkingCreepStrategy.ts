import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class ParkingCreepStrategy implements CreepStrategy {
  private readonly _parkPosition = { x: 25, y: 25 };

  get name() {
    return "park" + (this.targetRoomName ? (' ' + this.targetRoomName) : '');
  }

  constructor(
    private readonly targetRoomName?: string) {
  }

  tick(creep: CreepDecorator) {
    let targetRoomName = this.targetRoomName || creep.creep.room.name;
    if(creep.creep.room.name === targetRoomName && creep.creep.pos.x === this._parkPosition.x && creep.creep.pos.y === this._parkPosition.y) {
        return creep.setStrategy(new StrategyPickingCreepStrategy());
    }

    creep.moveTo(new RoomPosition(this._parkPosition.x, this._parkPosition.y, targetRoomName), { ignoreCreeps: true });
  }
}
