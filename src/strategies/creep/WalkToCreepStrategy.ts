import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";

@profile
export default class WalkToCreepStrategy implements CreepStrategy {
  get name() {
    return "👞" + this.successorStrategy.name;
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly targetId: string,
    private readonly successorStrategy: CreepStrategy
  ) {

  }

  tick() {
    let path = this.creep.tile.getPathTo(this.targetId);
    if(path === null) {
      return this.successorStrategy;
    }

    let moveResult = this.creep.creep.moveByPath([path.nextStep.position]);
    if(moveResult !== OK) {
      throw new Error('Move error: ' + moveResult);
    }
  }

}
