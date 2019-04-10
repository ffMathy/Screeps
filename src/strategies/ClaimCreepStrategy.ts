import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class ClaimCreepStrategy implements CreepStrategy {
  get name() {
    return "claim";
  }

  constructor(private readonly targetRoomName: string) {
  }

  tick(creep: CreepDecorator) {
    creep.creep.say('!');
    creep.moveTo(new RoomPosition(25, 25, this.targetRoomName), { range: 10, ignoreCreeps: true });
  }
}
