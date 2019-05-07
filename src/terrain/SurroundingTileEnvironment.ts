import Arrays from "helpers/Arrays";
import TileState from "./TileState";

export interface TileStateEnvironmentDecorator {
  tile: TileState;
  distance: number;
  radius: number;
}

export default class SurroundingTileEnvironment {
  tilesOrderedByProximity: TileStateEnvironmentDecorator[];
  tilesGroupedByProximity: {[proximity: number]: TileStateEnvironmentDecorator[]};

  availableTiles: TileStateEnvironmentDecorator[];
  occupiedTiles: TileStateEnvironmentDecorator[];

  entrypoint: TileState;

  private readonly visuals: ((visual: RoomVisual) => RoomVisual)[];

  private walkableTiles: TileState[];

  constructor(
    public readonly radius: number,
    public readonly minimumRadius: number,
    public readonly center: TileState,
    private readonly tiles: TileState[],
    private readonly amount: number,
    private readonly avoidRoads: boolean)
  {
    this.visuals = [];
  }

  initialize() {
    console.log('init-env', this.center.position, this.radius);

    this.tilesGroupedByProximity = [];
    this.tilesOrderedByProximity = [];

    this.availableTiles = [];
    this.occupiedTiles = [];

    this.walkableTiles = this.tiles
      .filter(x => x.isWalkable)
      .filter(x => {
        if(this.avoidRoads)
          return !x.road;

        return true;
      });

    this.entrypoint = this.getEntryPoint(this.center);

    let count = 0;
    this.tilesOrderedByProximity = this.walkableTiles
      .map(t => {
        let path = this.center.getPathTo(t.position);
        if(path === null)
          return null;

        let radius = Math.max(
          Math.abs(t.position.x - this.center.position.x),
          Math.abs(t.position.y - this.center.position.y)
        );

        return {
          distance: path.nextTiles.length,
          radius: radius,
          tile: t
        } as TileStateEnvironmentDecorator;
      })
      .filter(x => !!x)
      .sort((a, b) => a.distance - b.distance)
      .filter(t => this.minimumRadius === 1 || t.radius > (this.minimumRadius || -1))
      .filter(t => t.radius <= 1 || (t.radius > 2 && (t.tile.position.x % 2 !== t.tile.position.y % 2)))
      .filter(() => count++ < (this.amount === -1 ? 1337 : this.amount))
      .filter(t => this.entrypoint.terrain.reserveSpot(t.tile.position.x, t.tile.position.y, this));

    for (let tileDecorator of this.tilesOrderedByProximity) {
      if(!this.tilesGroupedByProximity[tileDecorator.radius])
        this.tilesGroupedByProximity[tileDecorator.radius] = [];

      Arrays.add(this.tilesGroupedByProximity[tileDecorator.radius], tileDecorator);

      tileDecorator.tile.onCreepChanged.addListener(this.onTileChanged.bind(this, tileDecorator), false);
      tileDecorator.tile.onFutureCreepChanged.addListener(this.onTileChanged.bind(this, tileDecorator), false);
      tileDecorator.tile.onConstructionSiteChanged.addListener(this.onEnvironmentChanged.bind(this, tileDecorator), false);
      tileDecorator.tile.onStructureChanged.addListener(this.onEnvironmentChanged.bind(this, tileDecorator), false);

      this.onTileChanged(tileDecorator);

      this.addVisualFor(tileDecorator);
    }
  }

  dispose() {
    for(let tile of [...this.tilesOrderedByProximity])
      this.disposeTile(tile);
  }

  private disposeTile(tileDecorator: TileStateEnvironmentDecorator) {
    for(let visual of [...this.visuals])
      Arrays.removeFromMultiple(visual, tileDecorator.tile.terrain.room.visuals, this.visuals);

    Arrays.removeFromMultiple(
      tileDecorator,
      this.tilesOrderedByProximity,
      this.occupiedTiles,
      this.availableTiles,
      this.tilesGroupedByProximity[tileDecorator.radius]);
  }

  private addVisualFor(tileDecorator: TileStateEnvironmentDecorator) {
    let position = tileDecorator.tile.position;
    Arrays.addToMultiple((visual: RoomVisual) => {
      let color = this.availableTiles.indexOf(tileDecorator) > -1 ?
        '#00ff00' :
        '#ff0000';
      visual.circle(tileDecorator.tile.position, {
        radius: 0.1,
        opacity: 0.5,
        fill: color
      }).line(position.x, position.y, this.center.position.x, this.center.position.y, {
        opacity: 0.75,
        color: color,
        lineStyle: 'dashed',
        width: 0.03
      });
    }, this.center.terrain.room.visuals, this.visuals);
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

  private getEntryPoint(origin: TileState) {
    if(!origin)
      throw new Error('No origin set.');

    if(origin.constructionSite)
      return origin;

    if(!origin.position)
      throw new Error('No origin position set.');

    let center = this.getCenter(origin, this.walkableTiles);
    if(!center)
      throw new Error('No center found.');

    if(Math.round(center.x) === 0 && Math.round(center.y) === 0)
      return origin;

    let multiplierX = 1.5;
    let multiplierY = 1.5;

    let getNewCenter = () => ({
      x: Math.round(center.x * multiplierX) + origin.position.x,
      y: Math.round(center.y * multiplierY) + origin.position.y
    });

    let newCenter = getNewCenter();
    let minimumRadius = 2;
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

    if(!newCenter)
      throw new Error('New center not found.');

    let tile = origin.terrain.getTileAt(newCenter.x, newCenter.y);
    if(!tile)
      return origin;

    return tile;
  }

  private onEnvironmentChanged(tileDecorator: TileStateEnvironmentDecorator) {
    let tile = tileDecorator.tile;
    let isAvailable = !tile.structure && (!tile.constructionSite || tile.constructionSite.structureType === STRUCTURE_ROAD);
    if(!isAvailable) {
      this.disposeTile(tileDecorator);
      this.addVisualFor(tileDecorator);
    }

    this.onTileChanged(tileDecorator);
  }

  private onTileChanged(tileDecorator: TileStateEnvironmentDecorator) {
    let tile = tileDecorator.tile;
    if (tile.futureCreep) {
      Arrays.add(this.occupiedTiles, tileDecorator);
      Arrays.remove(this.availableTiles, tileDecorator);
    }
    else if (!tile.creep) {
      Arrays.insertAscending(this.availableTiles, tileDecorator, t => t.distance);
      Arrays.remove(this.occupiedTiles, tileDecorator);
    }
  }

  // private makeHighways() {
  //   if(this.center.terrain.room.constructionSites.length > 0 || this.radius <= 1)
  //     return;

  //   console.log('make highways');

  //   for(let source of this.center.terrain.room.sources) {
  //     if(this.makeHighwayTo(source.source.pos))
  //       return;
  //   }

  //   for(let spawn of this.center.terrain.room.spawns) {
  //     if(this.makeHighwayTo(spawn.spawn.pos))
  //       return;
  //   }

  //   this.makeHighwayTo(this.center.terrain.room.room.controller.pos);
  // }

  // private makeHighwayTo(position: RoomPosition) {
  //   if(SurroundingTileEnvironment.lastHighwayTick && SurroundingTileEnvironment.lastHighwayTick >= Game.time - 1)
  //     return true;

  //   SurroundingTileEnvironment.lastHighwayTick = Game.time;

  //   console.log('make highway', JSON.stringify(this.center.position), JSON.stringify(position));

  //   let originPosition = this.center.position;
  //   let positions = [originPosition, ...this.center.terrain.room
  //     .findWalkablePath(originPosition, position)
  //     .map(step => this.center.terrain.room.room.getPositionAt(step.x, step.y))];
  //   return this.center.terrain.room.createConstructionSites(positions, STRUCTURE_ROAD) > 0;
  // }
}
