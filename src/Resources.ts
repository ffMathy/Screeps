import CreepDecorator from "CreepDecorator";
import creeps from "creeps";

class Resources {
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

    this.reservations[resourceId] = creep;
    creep.memory.reservationId = resourceId;

    return true;
  }

  unreserve(_creep: CreepDecorator, resourceId: string) {
    delete this.reservations[resourceId];
  }

  isReserved(creep: CreepDecorator, resourceId: string) {
    return resourceId in this.reservations && this.reservations[resourceId].id !== creep.id;
  }

  static get instance() {
    if (!this.singleton)
      this.singleton = new Resources(creeps.all);

    return this.singleton;
  }
}

export default Resources;
