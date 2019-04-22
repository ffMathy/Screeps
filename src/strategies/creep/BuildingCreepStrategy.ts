import CreepDecorator from "CreepDecorator";
import StrategyPickingCreepStrategy from "./StrategyPickingCreepStrategy";
import Strategy from "strategies/Strategy";

export default class BuildingCreepStrategy implements Strategy {
  get name() {
    return "build";
  }

  constructor(
    private readonly creep: CreepDecorator
  ) {}

  tick() {
    if(this.creep.creep.carry.energy == 0)
      return this.creep.setStrategy(new StrategyPickingCreepStrategy(this.creep));

    var target = this.creep.room.constructionSites[0];
    if (target) {
      if (this.creep.creep.build(target) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(target);
      } else {
        target = Game.getObjectById(target.id);
        if(!target || target.progress >= target.progressTotal) {
          this.creep.room.refresh();
          return this.creep.setStrategy(new StrategyPickingCreepStrategy(this.creep));
        }
      }
    } else {
      return this.creep.setStrategy(new StrategyPickingCreepStrategy(this.creep));
    }
  }

}
