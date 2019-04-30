import CreepDecorator from "CreepDecorator";
import Arrays from "helpers/Arrays";
import TileState from "./TileState";

export interface TileStateEnvironmentDecorator {
  tile: TileState;
  distanceToOrigin: number;
}

export default class SurroundingTileEnvironment {
  readonly tilesOrderedByProximity: TileStateEnvironmentDecorator[];
  readonly tilesGroupedByProximity: {[proximity: number]: TileStateEnvironmentDecorator[]};

  readonly availableTiles: TileStateEnvironmentDecorator[];
  readonly occupiedTiles: TileStateEnvironmentDecorator[];

  readonly entrypoint: TileState;

  private static lastHighwayTick: number;

  constructor(
    private radius: number,
    minimumRadius: number,
    private readonly origin: TileState,
    tiles: TileState[],
    avoidRoads: boolean = false)
  {
    this.availableTiles = [];
    this.occupiedTiles = [];

    let walkableTiles = tiles
      .filter(x => x.isWalkable)
      .filter(x => {
        if(avoidRoads)
          return !x.road;

        return true;
      });

    this.entrypoint = this.getEntryPoint(origin, walkableTiles);

    if(!SurroundingTileEnvironment.lastHighwayTick)
      SurroundingTileEnvironment.lastHighwayTick = Game.time;

    this.makeHighways();
    origin.terrain.onChange.addListener(this.makeHighways.bind(this), true);

    Arrays.add(origin.terrain.room.visuals, (visual: RoomVisual) => {
      if (this.occupiedTiles.length === 0 || (origin.constructionSite && origin.constructionSite.structureType === STRUCTURE_ROAD))
        return;

      return visual.text(this.occupiedTiles.length + '/' + this.tilesOrderedByProximity.length, origin.position.x + 1, origin.position.y + 1);
    });

    this.tilesGroupedByProximity = [];
    this.tilesOrderedByProximity = walkableTiles
      .map(t => {
        let path = origin.getPathTo(t.position);
        return {
          distanceToOrigin: path !== null ? path.distance : 0,
          tile: t
        } as TileStateEnvironmentDecorator;
      })
      .sort((a, b) => a.distanceToOrigin - b.distanceToOrigin)
      .filter(t => t.distanceToOrigin >= (minimumRadius || 0))
      .filter(t => t.distanceToOrigin <= 1 || (t.tile.position.x % 2 === 1 && t.tile.position.y % 2 === 0));

    for (let tileDecorator of this.tilesOrderedByProximity) {
      if(!this.tilesGroupedByProximity[tileDecorator.distanceToOrigin])
        this.tilesGroupedByProximity[tileDecorator.distanceToOrigin] = [];

      Arrays.add(this.tilesGroupedByProximity[tileDecorator.distanceToOrigin], tileDecorator);

      tileDecorator.tile.onCreepChanged.addListener(this.onTileCreepChanged.bind(this, tileDecorator), false);
      tileDecorator.tile.onFutureCreepChanged.addListener(this.onTileCreepChanged.bind(this, tileDecorator), false);

      this.onTileCreepChanged(tileDecorator, tileDecorator.tile, tileDecorator.tile.creep);
    }
  }

  //TODO: get gravity point

  private getCenter(origin: TileState, tiles: TileState[]) {
    let x = tiles.map(x => x.position.x - origin.position.x);
    let avgX = x.reduce((a, b) => a + b) / x.length;

    let y = tiles.map(x => x.position.y - origin.position.y);
    let avgY = y.reduce((a, b) => a + b) / y.length;

    let center = { x: avgX, y: avgY };
    return center;
  }

  private getEntryPoint(origin: TileState, tiles: TileState[]) {
    let center = this.getCenter(origin, tiles);
    if(Math.round(center.x) === 0 && Math.round(center.y) === 0)
      return origin;

    let multiplierX = 1.5;
    let multiplierY = 1.5;

    let getNewCenter = () => ({
      x: Math.round(center.x * multiplierX) + origin.position.x,
      y: Math.round(center.y * multiplierY) + origin.position.y
    });

    let newCenter = getNewCenter();
    let minimumRadius = 3;
    let multiplierIncrement = 0.2;

    while(Math.abs(newCenter.x - origin.position.x) <= minimumRadius && Math.abs(newCenter.y - origin.position.y) <= minimumRadius) {
      multiplierX += multiplierIncrement;
      multiplierY += multiplierIncrement;

      newCenter = getNewCenter();
    }

    while(Math.abs(newCenter.x - origin.position.x) === 1) {
      multiplierX += multiplierIncrement;
      newCenter = getNewCenter();
    }

    while(Math.abs(newCenter.y - origin.position.y) === 1) {
      multiplierY += multiplierIncrement;
      newCenter = getNewCenter();
    }

    let tile = origin.terrain.getTileAt(newCenter.x, newCenter.y);
    if(tile.position.x !== origin.position.x || tile.position.y !== origin.position.y) {
      tile.terrain.room.visuals.push(v => {
        let color = this.availableTiles.length > 0 ? '#00ff00' : '#ff0000';
        return v.circle(tile.position, {
            radius: 1,
            fill: null,
            stroke: color,
            lineStyle: "dashed"
          }).line(tile.position, origin.position, {
            color: color,
            lineStyle: "dotted"
          });
        });
      }

    return tile;
  }

  private makeHighways() {
    if(this.origin.terrain.room.constructionSites.length > 0 || this.radius <= 1)
      return;

    console.log('make highways');

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
    if(SurroundingTileEnvironment.lastHighwayTick && SurroundingTileEnvironment.lastHighwayTick >= Game.time - 1)
      return true;

    SurroundingTileEnvironment.lastHighwayTick = Game.time;

    console.log('make highway', JSON.stringify(this.origin.position), JSON.stringify(position));

    let originPosition = this.origin.position;
    let positions = [originPosition, ...this.origin.terrain.room
      .findWalkablePath(originPosition, position)
      .map(step => this.origin.terrain.room.room.getPositionAt(step.x, step.y))];
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
