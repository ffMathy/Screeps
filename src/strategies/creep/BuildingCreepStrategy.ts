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
          return;
        } else {
          throw new Error('Build error: ' + buildResult);
        }
      } else {
        return null;
      }
    } else {
      this.creep.room.refresh();
      return null;
    }
  }

}
