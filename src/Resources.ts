import CreepDecorator from "CreepDecorator";
import creeps from "creeps";
import rooms from "rooms";

interface Resource {
  terrainCapacity: number;
  reservationCount: number;
}

export default class Resources {
  private resources: {[id: string]: Resource} = {};

  private static singleton: Resources;

  constructor(creeps: CreepDecorator[]) {
    this.resources = {};

    for(let source of rooms.mainRoom.sources) {
      let resource = {} as Resource;
      resource.reservationCount = 0;
      
      let tiles = source.room.lookForAtArea(LOOK_TERRAIN, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
      if(!Array.isArray(tiles))
        throw new Error('Could not load tiles.');

      resource.terrainCapacity = 9 - _.countBy(tiles, "terrain" ).wall;
      this.resources[source.id] = resource;
    }

    for (let creep of creeps) {
      if (creep.memory.reservationId)
        this.reserve(creep, creep.memory.reservationId);
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

  unreserve(creep: CreepDecorator) {
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

  static get instance() {
    if (!this.singleton)
      this.singleton = new Resources(creeps.all);

    return this.singleton;
  }
}
