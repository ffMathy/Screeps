import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";
import { Direction } from "helpers/Coordinates";

@profile
export default class WalkToCreepStrategy implements CreepStrategy {
  private direction: string;

  get name() {
    return "👞" + this.direction + this.successorStrategy.name;
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly targetId: string,
    private readonly successorStrategy: CreepStrategy
  ) {
    this.direction = "";
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
      // direction = (direction + 1) % 9;
      // if(direction === 0)
      //   direction++;
    }

    switch(direction) {
      case Direction.TOP_LEFT:
        this.direction = "↖";
        break;

      case Direction.TOP:
        this.direction = "⬆";
        break;

      case Direction.TOP_RIGHT:
        this.direction = "↗";
        break;

      case Direction.RIGHT:
        this.direction = "➡";
        break;

      case Direction.BOTTOM_RIGHT:
        this.direction = "↘";
        break;

      case Direction.BOTTOM:
        this.direction = "⬇";
        break;

      case Direction.BOTTOM_LEFT:
        this.direction = "↙";
        break;

      case Direction.LEFT:
        this.direction = "⬅";
        break;

      default:
        throw new Error('Unknown direction for emoji.');
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
