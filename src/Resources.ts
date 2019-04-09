import CreepDecorator from "CreepDecorator";
import RoomsDecorator from "RoomsDecorator";

interface Resource {
  terrainCapacity: number;
  reservationCount: number;
}

export default class Resources {
  private resources: {[id: string]: Resource} = {};

  constructor(rooms: RoomsDecorator) {
    this.resources = {};

    for(let room of rooms.all)
    for(let source of room.sources) {
      let resource = {} as Resource;
      resource.reservationCount = 0;

      let tiles = source.room.lookForAtArea(LOOK_TERRAIN, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
      if(!Array.isArray(tiles))
        throw new Error('Could not load tiles.');

      resource.terrainCapacity = 9 - _.countBy(tiles, "terrain" ).wall;
      this.resources[source.id] = resource;
    }
  }

  reserve(creep: CreepDecorator, resourceId: string) {
    if (this.isReserved(resourceId))
      return false;

    let resource = this.resources[resourceId];
    creep.memory.reservationId = resourceId;
    resource.reservationCount++;

    return true;
  }

  unreserve(creep: CreepDecorator | Creep) {
    let resourceId = creep.memory.reservationId;
    if(!resourceId)
      return;

    delete creep.memory.reservationId;

    if(this.resources[resourceId].reservationCount > 0)
      this.resources[resourceId].reservationCount--;

    //console.log('unreserved resource', resourceId);
  }

  isReserved(resourceId: string) {
    let resource = this.resources[resourceId];
    return resource.reservationCount >= resource.terrainCapacity;
  }
}
