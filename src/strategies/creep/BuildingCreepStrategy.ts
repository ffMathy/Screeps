import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";

@profile
export default class BuildingCreepStrategy implements CreepStrategy {
  get name() {
    return "build";
  }

  constructor(
    private readonly creep: CreepDecorator
  ) {}

  tick() {
    if(this.creep.creep.carry.energy == 0)
      return null;

    var target = this.creep.room.constructionSites[0];
    if (target) {
      if (this.creep.creep.build(target) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(target);
      } else {
        target = Game.getObjectById(target.id);
        if(!target || target.progress >= target.progressTotal) {
          this.creep.room.refresh();
          return null;
        }
      }
    } else {
      return null;
    }
  }

}
