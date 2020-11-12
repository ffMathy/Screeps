import RoomDecorator from "RoomDecorator";

import TileState from "terrain/TileState";
import EventHandler from "helpers/EventHandler";
import Coordinates from "helpers/Coordinates";
import Arrays from "helpers/Arrays";
import SurroundingTileEnvironment from "./SurroundingTileEnvironment";

declare interface Terrain {
  get(x: number, y: number): number
}


export default class TerrainDecorator {
  private readonly tiles: Array<TileState>;

  readonly spotTiles: Array<TileState>;

  private isInitialized: boolean;

  public readonly onChange: EventHandler<TerrainDecorator>;

  constructor(
    public readonly room: RoomDecorator,
    public readonly terrain: Terrain
  ) {
    this.tiles = new Array(50 * 50);
    this.spotTiles = [];
    this.onChange = new EventHandler(this);
  }

  initialize() {
    if(this.isInitialized)
      throw new Error('Already initialized.');

    this.isInitialized = true;
    for(let tile of this.tiles.filter(t => !!t))
      tile.initialize();
  }

  reserveSpot(x: number, y: number, owner: SurroundingTileEnvironment) {
    let tile = this.getTileAt(x, y);
    if(this.spotTiles.indexOf(tile) > -1)
      return false;

    let reservedNeighbours =
      this.isBlockedForOwner(x+1, y, owner) ||
      this.isBlockedForOwner(x-1, y, owner) ||
      this.isBlockedForOwner(x, y+1, owner) ||
      this.isBlockedForOwner(x, y-1, owner);
    if(reservedNeighbours)
      return false;

    tile.reservedBy = owner;
    return Arrays.add(this.spotTiles, tile);
  }

  private isBlockedForOwner(x: number, y: number, currentOwner: SurroundingTileEnvironment) {
    let tile = this.getTileAt(x, y);
    if(this.spotTiles.indexOf(tile) === -1)
      return false;

    return tile.reservedBy !== currentOwner;
  }

  getTileAt(position: RoomPosition): TileState
  getTileAt(x: number, y: number): TileState
  getTileAt(xOrPosition: number | RoomPosition, y?: number): TileState {
    let x: number = xOrPosition as any;
    if (typeof xOrPosition !== "number") {
      x = xOrPosition.x;
      y = xOrPosition.y;
    }

    x = Math.max(0, Math.min(49, x));
    y = Math.max(0, Math.min(49, y));

    let i = Coordinates.roomPositionToNumber(x, y);
    let tile = this.tiles[i];
    if (!tile) {
      let newTile = new TileState(
        this,
        x,
        y);
      tile = this.tiles[i] = newTile;

      if(this.isInitialized)
        newTile.initialize();
    }

    return tile;
  }

  getTilePopularity(x: number, y: number) {
    let tile = this.getTileAt(x, y);
    let tickDelta = Game.time - tile.popularity.lastIncreaseTick;
    return Math.max(0, tile.popularity.score - tickDelta);
  }

  increaseTilePopularity(x: number, y: number) {
    if (!this.room.room || !this.room.room.controller || this.room.room.controller.level <= 6)
      return;

    let tile = this.getTileAt(x, y);
    tile.popularity.lastIncreaseTick = Game.time;

    const maximumPopularity = 400;

    let popularity = Math.min(maximumPopularity, tile.popularity.score);
    if (popularity === maximumPopularity) {
      this.room.createConstructionSites([tile.position], STRUCTURE_ROAD);
      popularity = 1;
    }

    tile.popularity.score = popularity;
  }
}
