import RoomDecorator, { RoomStrategy } from '../../RoomDecorator';
import StrategyPickingRoomStrategy from './StrategyPickingRoomStrategy';
import Coordinates from 'helpers/Coordinates';

export default class ConstructStructuresRoomStrategy implements RoomStrategy {
  get name() {
    return "build";
  }

  constructor(private readonly room: RoomDecorator) {}

  tick() {
    let room = this.room;
    if(!room.room || !room.room.controller || !room.room.controller.my)
      return;

    let rawStructures = (room.room.find(FIND_STRUCTURES) as Structure[]) || [];
    let structures = rawStructures.filter(x => x.structureType !== STRUCTURE_ROAD);

    let typesToBuild = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION];
    let roomControllerLevel = room.room.controller ? room.room.controller.level : 0;
    for(let typeToBuild of typesToBuild) {
      const structuresOfType = structures.filter(s => s.structureType === typeToBuild);
      const constructionSitesOfType = room.constructionSites.filter(x => x.structureType === typeToBuild);

      let totalAvailable = 0;
      for(let level in CONTROLLER_STRUCTURES[typeToBuild]) {
        if(+level > roomControllerLevel)
          break;

        totalAvailable = +CONTROLLER_STRUCTURES[typeToBuild][level];
      }

      let countBuilt = structuresOfType.length + constructionSitesOfType.length;
      console.log('building', room.roomName, countBuilt, totalAvailable);

      let offset = countBuilt + (countBuilt % 2) - 1 + 48;
      while(countBuilt < totalAvailable) {
        let currentOffset = offset;

        let position = Coordinates.calculateSpiralOffset(currentOffset);
        position.x += room.room.controller.pos.x;
        position.y += room.room.controller.pos.y;

        offset += 2;

        let isWalkable = room.terrain.getTileAt(position.x, position.y).isWalkable;
        if(!isWalkable)
          continue;

        let buildResult = room.room.createConstructionSite(position.x, position.y, typeToBuild);
        if(buildResult === 0) {
          console.log('built', room.roomName, currentOffset, position.x, position.y);

          countBuilt++;
        } else if(buildResult === ERR_RCL_NOT_ENOUGH) {
          throw new Error('Could not build a ' + typeToBuild + ' with RCL ' + room.room.controller.level);
        } else if(buildResult === ERR_INVALID_TARGET) {
          //an existing building exists here
        } else if(buildResult === ERR_FULL) {
          //too many structures already

          //TODO: kill roads to make room.
          break;
        } else {
          console.log('build error', buildResult);
          throw new Error('Build error: ' + buildResult);
        }
      }
    }

    room.refresh();
    room.setStrategy(new StrategyPickingRoomStrategy(room));
  }
}
