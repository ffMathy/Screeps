import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";

@profile
export default class BuildingCreepStrategy implements CreepStrategy {
  get name() {
    return "build";
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly constructionSiteId: string
  ) {}

  tick() {
    if(this.creep.creep.carry.energy == 0)
      return null;

    var target = Game.getObjectById(this.constructionSiteId) as ConstructionSite;
    if (target) {
      let tile = this.creep.room.terrain.getTileAt(target.pos.x, target.pos.y);
      if(!tile.creep) {
        let buildResult = this.creep.creep.build(target);
        if (buildResult === OK) {
          tile.constructionSite = null;
          target = Game.getObjectById(target.id);
          if(!target || target.progress >= target.progressTotal) {
            this.creep.room.refresh();
            return null;
          }
        } else if(buildResult === ERR_INVALID_TARGET) {
          return null;
        } else {
          throw new Error('Build error: ' + buildResult);
        }
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

}
