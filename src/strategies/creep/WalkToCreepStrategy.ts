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

    if(this.creep.creep.fatigue !== 0)
      return;

    let direction = path.direction;
    if(path.nextStep.creep) {
      direction = (direction + 1) % 9;
      if(direction === 0)
        direction++;
    }

    let moveResult = this.creep.creep.move(direction);
    if(moveResult === ERR_BUSY) {
      //still being spawned - ignore.
      return;
    }

    if(moveResult !== OK) {
      throw new Error('Move error: ' + moveResult);
    }
  }

}
