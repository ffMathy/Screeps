import RoomDecorator, { RoomStrategy } from '../../RoomDecorator';
import ConstructStructuresRoomStrategy from './ConstructStructuresRoomStrategy';

export default class StrategyPickingRoomStrategy implements RoomStrategy {
  private _lastControllerLevel: number;

  constructor(private readonly room: RoomDecorator) {
    this._lastControllerLevel = null;
  }

  get name() {
    return "look";
  }

  tick() {
    let room = this.room;
    if(room.room && room.room.controller) {
      if(room.room.controller.level !== this._lastControllerLevel) {
        if(this._lastControllerLevel !== null)
          room.setStrategy(new ConstructStructuresRoomStrategy(room));

        this._lastControllerLevel = room.room.controller.level;
      }
    }

    for(let spawn of room.spawns)
      spawn.tick();
  }
}
