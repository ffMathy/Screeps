import CreepDecorator from "CreepDecorator";
import creeps from "creeps";

export default class Resources {
  private reservations = {};

  private static singleton: Resources;

  constructor(creeps: CreepDecorator[]) {
    for (let creep of creeps) {
      if (creep.memory.reservationId)
        this.reserve(creep, creep.memory.reservationId);
    }
  }

  reserve(creep: CreepDecorator, resourceId: string) {
    if (this.isReserved(creep, resourceId))
      return false;

    if(this.reservations[resourceId] !== creep)
      console.log('reserved resource', creep.creep.id, resourceId);

    this.reservations[resourceId] = creep;
    creep.memory.reservationId = resourceId;

    return true;
  }

  unreserve(creep: CreepDecorator) {
    let resourceId = creep.memory.reservationId;
    if(!resourceId)
      return;

    if(!(resourceId in this.reservations))
      return;

    console.log('unreserved resource', this.reservations[resourceId].creep.id, resourceId);
    delete this.reservations[resourceId];
  }

  isReservedBy(creep: CreepDecorator, resourceId: string) {
    return resourceId in this.reservations && this.reservations[resourceId].creep.id === creep.creep.id;
  }

  isReserved(creep: CreepDecorator, resourceId: string) {
    return resourceId in this.reservations && this.reservations[resourceId].creep.id !== creep.creep.id;
  }

  static get instance() {
    if (!this.singleton)
      this.singleton = new Resources(creeps.all);

    return this.singleton;
  }
}
