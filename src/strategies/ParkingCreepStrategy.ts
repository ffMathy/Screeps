import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class ParkingCreepStrategy implements CreepStrategy {
  private readonly _parkPosition = { x: 25, y: 25 };

  get name() {
    return "park";
  }

  constructor(
    private readonly targetRoomName?: string) {
  }

  tick(creep: CreepDecorator) {
    if((Game.time % 15 === 0)) {
        return creep.setStrategy(new StrategyPickingCreepStrategy());
    }

    creep.moveTo(new RoomPosition(this._parkPosition.x, this._parkPosition.y, this.targetRoomName || creep.creep.room.name), { range: 2, ignoreCreeps: true });
  }
}
