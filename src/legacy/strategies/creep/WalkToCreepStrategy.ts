import CreepDecorator from "CreepDecorator";
import { CreepStrategy } from "strategies/Strategy";

import Coordinates, { Direction } from "legacy/helpers/Coordinates";


export default class WalkToCreepStrategy implements CreepStrategy {
  private direction: string;

  get name() {
    if(!this.successorStrategy)
      return this.direction || "?";

    return this.direction + " " + this.successorStrategy.name;
  }

  constructor(
    private readonly creep: CreepDecorator,
    private via: RoomPosition,
    private readonly targetPosition: RoomPosition,
    private readonly successorStrategy: CreepStrategy
  ) {
    this.direction = "";
  }

  tick() {
    //if spawning, the creep will be on top of a spawn temporarily.
    if(this.creep.tile.structure)
      return;

    if(!this.creep.futureTile)
      this.creep.futureTile = this.creep.room.terrain.getTileAt(this.targetPosition);

    let destination = this.via || this.targetPosition;
    let path = this.creep.tile.getPathTo(destination);
    if(path === null) {
      console.log('no-path', this.creep.creep.name, this.creep.creep.pos, destination);
      throw new Error('No path found.');
    }

    let isFinished = path.nextTile === null;
    if(isFinished) {
      if(this.via) {
        this.via = null;
        return;
      } else {
        return this.successorStrategy;
      }
    }

    let direction = path.nextDirection;
    this.direction = this.getDirectionEmojiFromDirection(direction);

    try {
      if(path.nextTiles[0].structure) {
        throw new Error('Trying to walk into structure - perhaps the terrain was not refreshed?');
      }

      if(path.nextTiles[0].creep || path.nextTiles[0].structure) {
        direction = Math.floor(Math.random() * 7.5) + 1;
        this.direction += this.getDirectionEmojiFromDirection(direction);
      }

      let directionCoordinates = Coordinates.coordinatesFromDirection(direction);
      let newCoordinates = { x: directionCoordinates.x + this.creep.creep.pos.x, y: directionCoordinates.y + this.creep.creep.pos.y };
      if(newCoordinates.x === 0 || newCoordinates.y === 0 || newCoordinates.x === 49 || newCoordinates.y === 49)
        return;

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
    } catch(ex) {
      console.log(this.creep.creep.name,
        this.successorStrategy && this.successorStrategy.name,
        JSON.stringify(path.nextTiles[0].position),
        JSON.stringify(path.nextTiles[path.nextTiles.length-1].position));
      throw ex;
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
