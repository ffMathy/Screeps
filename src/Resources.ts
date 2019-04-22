import CreepDecorator from "CreepDecorator";
import RoomsDecorator from "RoomsDecorator";

interface Resource {
  terrainCapacity: number;
  reservationCount: number;
  id: string;
}

export default class Resources {
  private resources: {[id: string]: Resource} = {};

  constructor(private readonly rooms: RoomsDecorator) {
    this.resources = {};
  }

  initialize() {
    for(let room of this.rooms.all)
    for(let source of room.sources) {
      let resource = {} as Resource;

      let tiles = source.room.lookForAtArea(LOOK_TERRAIN, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
      if(!Array.isArray(tiles))
        throw new Error('Could not load tiles.');

      let creeps = source.room.lookForAtArea(LOOK_CREEPS, source.pos.y-1, source.pos.x-1, source.pos.y+1, source.pos.x+1, true);
      if(!Array.isArray(creeps))
        throw new Error('Could not load creeps.');

      resource.id = source.id;
      resource.reservationCount = Math.floor(creeps.length);
      resource.terrainCapacity = 9 - _.countBy(tiles, "terrain").wall;

      this.resources[source.id] = resource;
    }
  }

  reserve(creep: CreepDecorator, resourceId: string) {
    if (this.isReserved(resourceId))
      return false;

    let resource = this.resources[resourceId];
    creep.memory.reservationId = resourceId;
    resource.reservationCount++;

    this.announceReservationCount(creep, this.resources[resourceId]);

    return true;
  }

  private announceReservationCount(creep: CreepDecorator, resource: Resource) {
    creep.room.sayAt(Game.getObjectById(resource.id), resource.reservationCount);
  }

  unreserve(creep: CreepDecorator | Creep) {
    let resourceId = creep.memory.reservationId;
    if(!resourceId)
      return;

    delete creep.memory.reservationId;

    if(this.resources[resourceId].reservationCount > 0)
      this.resources[resourceId].reservationCount--;

    if(creep instanceof CreepDecorator)
      this.announceReservationCount(creep, this.resources[resourceId]);
  }

  isReserved(resourceId: string) {
    let resource = this.resources[resourceId];
    return resource.reservationCount >= resource.terrainCapacity;
  }
}
