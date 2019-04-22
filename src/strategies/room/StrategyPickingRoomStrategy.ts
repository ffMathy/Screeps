import RoomDecorator, { RoomStrategy } from '../../RoomDecorator';
import ConstructStructuresRoomStrategy from './ConstructStructuresRoomStrategy';

export default class StrategyPickingRoomStrategy implements RoomStrategy {
  private _lastControllerLevel: number;

  constructor(private readonly room: RoomDecorator) {
    this._lastControllerLevel = null;
    if(room.room && room.room.controller)
      this._lastControllerLevel = room.room.controller.level;
  }

  get name() {
    return "look";
  }

  tick() {
    let room = this.room;
    if(room.room && room.room.controller) {
      if(room.room.controller.level !== this._lastControllerLevel) {
        this._lastControllerLevel = room.room.controller.level;
        return room.setStrategy(new ConstructStructuresRoomStrategy(room));
      }
    }

    for(let spawn of room.spawns)
      spawn.tick();
  }
}
