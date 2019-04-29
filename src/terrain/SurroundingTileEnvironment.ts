import CreepDecorator from "CreepDecorator";
import Arrays from "helpers/Arrays";
import TileState from "./TileState";

export interface TileStateEnvironmentDecorator {
  tile: TileState;
  distanceToOrigin: number;
}

export default class SurroundingTileEnvironment {
  readonly tilesByProximity: TileStateEnvironmentDecorator[];
  readonly availableTiles: TileStateEnvironmentDecorator[];
  readonly occupiedTiles: TileStateEnvironmentDecorator[];

  private static lastHighwayTick: number;

  constructor(private readonly radius: number, private readonly origin: TileState, tiles: TileState[]) {
    this.availableTiles = [];
    this.occupiedTiles = [];

    if(!SurroundingTileEnvironment.lastHighwayTick)
      SurroundingTileEnvironment.lastHighwayTick = Game.time;

    this.makeHighways();
    origin.terrain.onChange.addListener(this.makeHighways.bind(this), true);

    Arrays.add(origin.terrain.room.visuals, (visual: RoomVisual) => {
      if (this.occupiedTiles.length === 0 || (origin.constructionSite && origin.constructionSite.structureType === STRUCTURE_ROAD))
        return;

      return visual.text(this.occupiedTiles.length + '/' + this.tilesByProximity.length, origin.position.x + 1, origin.position.y + 1);
    });

    this.tilesByProximity = tiles
      .filter(x => !x.constructionSite || x.constructionSite.structureType === STRUCTURE_ROAD)
      .map(t => {
        let path = origin.getPathTo(t.position);
        return {
          distanceToOrigin: path !== null ? path.distance : 0,
          tile: t
        } as TileStateEnvironmentDecorator;
      })
      .sort((a, b) => a.distanceToOrigin - b.distanceToOrigin)
      .filter(t => t.distanceToOrigin <= 1 || (t.tile.position.x % 2 === 1 && t.tile.position.y % 2 === 0));

    for (let tileDecorator of this.tilesByProximity) {
      tileDecorator.tile.onCreepChanged.addListener(this.onTileCreepChanged.bind(this, tileDecorator), false);
      tileDecorator.tile.onFutureCreepChanged.addListener(this.onTileCreepChanged.bind(this, tileDecorator), false);

      this.onTileCreepChanged(tileDecorator, tileDecorator.tile, tileDecorator.tile.creep);
    }
  }

  private makeHighways() {
    if(SurroundingTileEnvironment.lastHighwayTick && SurroundingTileEnvironment.lastHighwayTick >= Game.time - 10)
      return;

    SurroundingTileEnvironment.lastHighwayTick = Game.time;

    if(this.origin.terrain.room.constructionSites.length > 0 || this.radius <= 1)
      return;

    for(let source of this.origin.terrain.room.sources) {
      if(this.makeHighwayTo(source.pos))
        return;
    }

    for(let spawn of this.origin.terrain.room.spawns) {
      if(this.makeHighwayTo(spawn.spawn.pos))
        return;
    }

    this.makeHighwayTo(this.origin.terrain.room.room.controller.pos);
  }

  private makeHighwayTo(position: RoomPosition) {
    let originPosition = this.origin.position;
    if(originPosition.x === position.x && originPosition.y === position.y)
      return false;

    let positions = this.origin.terrain.room
      .findPath(originPosition, position)
      .map(step => this.origin.terrain.room.room.getPositionAt(step.x, step.y));
    return this.origin.terrain.room.createConstructionSites(positions, STRUCTURE_ROAD) > 0;
  }

  private onTileCreepChanged(tileDecorator: TileStateEnvironmentDecorator, tile: TileState, _creep: CreepDecorator) {
    if (tile.futureCreep) {
      Arrays.add(this.occupiedTiles, tileDecorator);
      Arrays.remove(this.availableTiles, tileDecorator);
    }
    else if (!tile.creep) {
      Arrays.insertAscending(this.availableTiles, tileDecorator, t => t.distanceToOrigin);
      Arrays.remove(this.occupiedTiles, tileDecorator);
    }
  }
}
