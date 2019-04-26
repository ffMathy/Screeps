import RoomDecorator from "RoomDecorator";
import profile from "profiler";
import CreepDecorator from "CreepDecorator";
import Coordinates, { Direction } from "helpers/Coordinates";

declare interface Terrain {
  get(x: number, y: number): number
}

export class TileState {
  readonly popularity = {
    score: 0,
    lastIncreaseTick: 0
  };

  readonly position: RoomPosition;

  private readonly pathsTo: {
    [resourceName: string]: {
      distance: number,
      nextStep: TileState,
      direction: Direction
    }
  } = {};

  creep: CreepDecorator;

  constructor(
    private readonly terrain: TerrainDecorator,
    x: number,
    y: number)
  {
    this.position = new RoomPosition(x, y, terrain.room.roomName);
  }

  getPathTo(objectId: string) {
    let path = this.pathsTo[objectId];
    if(typeof path !== "undefined")
      return path;

    let target = Game.getObjectById(objectId) as Source;
    if(!target)
      throw new Error('Walk target with ID ' + objectId + ' not found.');

    let steps = this.terrain.room.room.findPath(
      this.position,
      target.pos);

    let nextStep: TileState;
    if(steps.length > 0) {
      let firstStep = steps[0];
      nextStep = this.terrain.getTileAt(firstStep.x, firstStep.y);
    }

    let hasReachedDestination = Math.abs(target.pos.x - this.position.x) <= 1 && Math.abs(target.pos.y - this.position.y) <= 1;

    this.pathsTo[objectId] = hasReachedDestination ? null : {
      distance: steps.length,
      nextStep: nextStep,
      direction: Coordinates.directionFromCoordinates(this.position, nextStep.position)
    };

    return this.pathsTo[objectId];
  }
}

@profile
export default class TerrainDecorator {
  private readonly tiles: Array<TileState>;

  constructor(
    public readonly room: RoomDecorator,
    public readonly terrain: Terrain
  ) {
    this.tiles = new Array(50 * 50);
  }

  getModifier(x: number, y: number) {
    return this.terrain.get(x, y);
  }

  getTileAt(x: number, y: number) {
    let i = x + 50*y;
    let tile = this.tiles[i];
    if(!tile) {
      tile = this.tiles[i] = new TileState(
        this,
        x,
        y);
    }

    return tile;
  }

  getTilePopularity(x: number, y: number) {
    let tile = this.getTileAt(x, y);
    let tickDelta = Game.time - tile.popularity.lastIncreaseTick;
    return Math.max(0, tile.popularity.score - tickDelta);
  }

  increaseTilePopularity(x: number, y: number) {
    if(!this.room.room || !this.room.room.controller || this.room.room.controller.level < 2)
      return;

    let tile = this.getTileAt(x, y);
    tile.popularity.lastIncreaseTick = Game.time;

    const maximumPopularity = 400;

    let popularity = Math.min(maximumPopularity, tile.popularity.score+2);
    if(popularity === maximumPopularity) {
      this.room.createConstructionSite(x, y, STRUCTURE_ROAD);
      popularity = 1;
    }

    tile.popularity.score = popularity;
  }
}
