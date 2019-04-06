import CreepDecorator, { CreepStrategy } from "CreepDecorator";

export default class BuildingCreepStrategy implements CreepStrategy {
  tick(creep: CreepDecorator) {
    creep.build();
  }

}
