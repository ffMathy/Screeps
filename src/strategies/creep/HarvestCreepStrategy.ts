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
      return null;
    }

    let harvestResult = this.creep.creep.harvest(
      Game.getObjectById(this.reservedSourceId)
    );
    if(harvestResult !== OK) {
      throw new Error('Harvest error: ' + harvestResult);
    }
  }
}
