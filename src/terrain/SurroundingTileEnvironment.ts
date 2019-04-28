import CreepDecorator from "CreepDecorator";
import Arrays from "helpers/Arrays";
import TileState from "./TileState";

export default class SurroundingTileEnvironment {
  readonly tilesByProximity: TileState[];
  readonly availableTiles: TileState[];
  readonly occupiedTiles: TileState[];

  constructor(origin: TileState, tiles: TileState[]) {
    this.availableTiles = [];
    this.occupiedTiles = [];

    //TODO: make highways (first from center to center, then when completed, from all adjacent fields)

    Arrays.add(origin.terrain.room.visuals, (visual: RoomVisual) => {
      if (this.occupiedTiles.length === 0)
        return;

      return visual.text(this.occupiedTiles.length + '/' + this.tilesByProximity.length, origin.position.x + 1, origin.position.y + 1);
    });

    this.tilesByProximity = tiles
      .sort((a, b) => {
        let aPath = origin.getPathTo(a.position);
        let bPath = origin.getPathTo(b.position);

        let aDistance = aPath !== null ? aPath.distance : 0;
        let bDistance = bPath !== null ? bPath.distance : 0;

        return aDistance - bDistance;
      });

    for (let tile of this.tilesByProximity) {
      tile.onCreepChanged.addListener(this.onTileCreepChanged.bind(this));
      tile.onFutureCreepChanged.addListener(this.onTileCreepChanged.bind(this));

      this.onTileCreepChanged(tile, tile.creep);
    }
  }

  private onTileCreepChanged(tile: TileState, _creep: CreepDecorator) {
    if (tile.futureCreep) {
      Arrays.add(this.occupiedTiles, tile);
      Arrays.remove(this.availableTiles, tile);
    }
    else if (!tile.creep) {
      Arrays.add(this.availableTiles, tile);
      Arrays.remove(this.occupiedTiles, tile);
    }
  }
}
