import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";
import profile from "profiler";
import Coordinates, { Direction } from "helpers/Coordinates";

@profile
export default class WalkToCreepStrategy implements CreepStrategy {
  private direction: string;
  private prefersLeft: boolean;

  get name() {
    return this.direction + " " + this.successorStrategy.name;
  }

  constructor(
    private readonly creep: CreepDecorator,
    private readonly targetPosition: RoomPosition,
    private readonly successorStrategy: CreepStrategy
  ) {
    this.direction = "";
    this.prefersLeft = null;
  }

  tick() {
    if(!this.creep.futureTile)
      this.creep.futureTile = this.creep.room.terrain.getTileAt(this.targetPosition);

    let path = this.creep.tile.getPathTo(this.targetPosition);
    if(path === null) {
      return this.successorStrategy;
    }

    let direction = path.nextDirection;
    this.direction = this.getDirectionEmojiFromDirection(direction);

    if(path.nextStep.creep) {
      let leftDirection = Coordinates.rotateDirectionLeft(direction);
      let rightDirection = Coordinates.rotateDirectionRight(direction);

      let leftTile = path.nextStep.getTileInDirection(leftDirection);
      let rightTile = path.nextStep.getTileInDirection(rightDirection);

      let tries = 0;
      let foundFreedom = !leftTile.creep && !rightTile.creep;
      while(tries++ < 5 && !foundFreedom) {
        leftDirection = Coordinates.rotateDirectionLeft(leftDirection);
        rightDirection = Coordinates.rotateDirectionRight(rightDirection);

        leftTile = path.nextStep.getTileInDirection(leftDirection);
        rightTile = path.nextStep.getTileInDirection(rightDirection);

        foundFreedom =
          (this.prefersLeft === null && (!leftTile.creep || !rightTile.creep)) ||
          (this.prefersLeft === true && !leftTile.creep) ||
          (this.prefersLeft === false && !rightTile.creep);
      }

      if(!foundFreedom) {
        // this.prefersLeft = !this.prefersLeft;
        this.creep.say("⏹" + this.direction);
        return;
      }

      let useLeft = this.prefersLeft !== false;
      direction = (!useLeft || leftTile.creep) ? rightDirection : leftDirection;
      this.direction = this.getDirectionEmojiFromDirection(direction);
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
