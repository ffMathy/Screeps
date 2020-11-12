import { CreepStrategy } from "strategies/Strategy";

import CreepDecorator from "CreepDecorator";


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
