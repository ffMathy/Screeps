import CreepDecorator from "CreepDecorator";
import GameDecorator from "GameDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";

@profile
export default class HarvestCreepStrategy implements CreepStrategy {
  get name() {
    return "harvest";
  }

  constructor(
    private readonly creep: CreepDecorator
  ) {}

  tick() {
    if(this.creep.creep.carry.energy == this.creep.creep.carryCapacity) {
      GameDecorator.instance.resources.unreserve(this.creep);
      return null;
    }

    let sources = this.creep.room.sources;
    let reservedId = this.creep.memory.reservationId;
    let reservedSource: Source = null;
    if(reservedId) {
      reservedSource = sources.find(x => x.id === reservedId);
    }

    if(!reservedSource) {
      for (let source of sources) {
        if(!GameDecorator.instance.resources.reserve(this.creep, source.id))
          continue;

        reservedSource = source;
        break;
      }
    }

    if (reservedSource) {
      if(this.creep.creep.harvest(reservedSource) === ERR_NOT_IN_RANGE) {
        this.creep.moveTo(reservedSource);
      }
    } else {
      GameDecorator.instance.resources.unreserve(this.creep);
      return null;
    }
  }
}
