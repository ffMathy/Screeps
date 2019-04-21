import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";

export default class BuildingCreepStrategy implements CreepStrategy {
  get name() {
    return "build";
  }

  tick(creep: CreepDecorator) {
    if(creep.creep.carry.energy == 0)
      return creep.setStrategy(new StrategyPickingCreepStrategy());

    var target = creep.room.constructionSites[0];
    if (target) {
      if (creep.creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
      } else {
        target = Game.getObjectById(target.id);
        if(!target || target.progress >= target.progressTotal) {
          creep.room.refresh();
          return creep.setStrategy(new StrategyPickingCreepStrategy());
        }
      }
    } else {
      return creep.setStrategy(new StrategyPickingCreepStrategy());
    }
  }

}
