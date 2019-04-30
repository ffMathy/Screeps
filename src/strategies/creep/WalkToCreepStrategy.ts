import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";
import { Direction } from "helpers/Coordinates";
import GameDecorator from "GameDecorator";

@profile
export default class WalkToCreepStrategy implements CreepStrategy {
  private direction: string;

  get name() {
    if(!this.successorStrategy)
      return this.direction || "?";

    return this.direction + " " + this.successorStrategy.name;
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly targetPosition: RoomPosition,
    private readonly successorStrategy: CreepStrategy
  ) {
    this.direction = "";
  }

  tick() {
    if(GameDecorator.instance.cpuUsedPercentage > 0.5)
      return;

    if(!this.creep.futureTile)
      this.creep.futureTile = this.creep.room.terrain.getTileAt(this.targetPosition);

    let path = this.creep.tile.getPathTo(this.targetPosition);
    if(path === null) {
      return this.successorStrategy;
    }

    let direction = path.nextDirection;
    this.direction = this.getDirectionEmojiFromDirection(direction);

    if(path.nextStep.structure) {
      console.log(this.creep.creep.name,
        this.successorStrategy && this.successorStrategy.name,
        JSON.stringify(path.nextStep.position));
      throw new Error('Trying to walk into structure - perhaps the terrain was not refreshed?');
    }

    if(path.nextStep.creep || path.nextStep.structure) {
      direction = Math.floor(Math.random() * 7.5) + 1;
      this.direction += this.getDirectionEmojiFromDirection(direction);
    }

    let moveResult = this.creep.creep.move(direction);
    if(moveResult === ERR_BUSY) {
      //still being spawned - ignore.
      return;
    } else if(moveResult === ERR_TIRED) {
      return;
    }

    if(moveResult !== OK) {
      throw new Error('Move error: ' + moveResult);
    }
  }


  private getDirectionEmojiFromDirection(direction: Direction) {
    switch (direction) {
      case Direction.TOP_LEFT:
        return "↖";

      case Direction.TOP:
        return "⬆";

      case Direction.TOP_RIGHT:
        return "↗";

      case Direction.RIGHT:
        return "➡";

      case Direction.BOTTOM_RIGHT:
        return "↘";

      case Direction.BOTTOM:
        return "⬇";

      case Direction.BOTTOM_LEFT:
        return "↙";

      case Direction.LEFT:
        return "⬅";

      default:
        throw new Error('Unknown direction for emoji.');
    }
  }
}
