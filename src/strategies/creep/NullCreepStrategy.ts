import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";
import CreepDecorator from "CreepDecorator";

@profile
export default class NullCreepStrategy implements CreepStrategy {
  get name() {
    return "💤";
  }

  constructor(private readonly creep: CreepDecorator) {

  }

  tick() {
    this.creep.say(this.name);
  }
}
