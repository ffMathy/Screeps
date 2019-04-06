import CreepDecorator, { CreepStrategy } from "CreepDecorator";

export default class ParkingCreepStrategy implements CreepStrategy {
  tick(creep: CreepDecorator) {
    creep.park();
  }
}
