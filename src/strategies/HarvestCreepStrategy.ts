import CreepDecorator, { CreepStrategy } from "CreepDecorator";

export default class HarvestCreepStrategy implements CreepStrategy {
  tick(creep: CreepDecorator) {
    creep.harvestSource();
  }
}
