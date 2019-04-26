import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";
// import GameDecorator from "GameDecorator";

@profile
export default class HarvestCreepStrategy implements CreepStrategy {
  get name() {
    return "harvest";
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly reservedSourceId: string
  ) {}

  tick() {
    if(this.creep.creep.carry.energy == this.creep.creep.carryCapacity) {
      // GameDecorator.instance.resources.unreserve(this.creep);
      return null;
    }

    // let sources = this.creep.room.sources;
    // let reservedId = this.creep.memory.reservationId;
    // let reservedSource: Source = null;
    // if(reservedId) {
    //   reservedSource = sources.find(x => x.id === reservedId);
    //   GameDecorator.instance.resources.reserve(this.creep, reservedId);
    // }

    // if(!reservedSource) {
    //   for (let source of sources) {
    //     if(!GameDecorator.instance.resources.reserve(this.creep, source.id))
    //       continue;

    //     reservedSource = source;
    //     break;
    //   }
    // }

    let harvestResult = this.creep.creep.harvest(
      Game.getObjectById(this.reservedSourceId)
    );
    if(harvestResult !== OK) {
      throw new Error('Harvest error: ' + harvestResult);
    }
  }
}
