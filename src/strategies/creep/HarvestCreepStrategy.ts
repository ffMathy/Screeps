import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";

// import GameDecorator from "GameDecorator";


export default class HarvestCreepStrategy implements CreepStrategy {
  get name() {
    return "harvest";
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly reservedSourceId: string
  ) {}

  tick() {
    if(this.creep.creep.store.getFreeCapacity() === 0) {
      return null;
    }

    let harvestResult = this.creep.creep.harvest(
      Game.getObjectById(this.reservedSourceId)
    );
    if(harvestResult === ERR_BUSY) {
      //creep is still being spawned.
    } else if(harvestResult !== OK) {
      throw new Error('Harvest error: ' + harvestResult);
    }
  }
}
