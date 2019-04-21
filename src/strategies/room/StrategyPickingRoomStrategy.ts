import RoomDecorator, { RoomStrategy } from '../../RoomDecorator';
import RoomsDecorator from 'RoomsDecorator';
import Arrays from 'helpers/Arrays';
import ConstructStructuresRoomStrategy from './ConstructStructuresRoomStrategy';

export default class StrategyPickingRoomStrategy implements RoomStrategy {
  private _lastControllerLevel: number;

  get name() {
    return "look";
  }

  tick(rooms: RoomsDecorator, room: RoomDecorator) {
    if(room.room && room.room.controller) {
      if(room.room.controller.level !== this._lastControllerLevel) {
        this._lastControllerLevel = room.room.controller.level;

        return room.setStrategy(new ConstructStructuresRoomStrategy());
      }

      if(room.isPopulationMaintained) {
        Arrays.add(rooms.lowPopulation, room);
        room.sayAt(room.room.controller, '😃');
      } else {
        Arrays.remove(rooms.lowPopulation, room);
        room.sayAt(room.room.controller, '😟');
      }
    }

    for(let spawn of room.spawns)
      spawn.tick();
  }
}
