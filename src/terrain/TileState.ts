import CreepDecorator from "CreepDecorator";
import Coordinates, { Direction } from "helpers/Coordinates";
import EventHandler from "../helpers/EventHandler";
import SurroundingTileEnvironment from "terrain/SurroundingTileEnvironment";
import TerrainDecorator from "./TerrainDecorator";

//TODO: use LinkedList
export class Path {
  target: TileState;
  origin: TileState;

  nextTiles: TileState[];

  constructor(private readonly tile: TileState) {

  }

  get nextTile() {
    return this.nextTiles[0] || null;
  }

  get nextDirection() {
    let nextStep = this.nextTile;
    if(!nextStep)
      return null;

    return Coordinates.directionFromCoordinates(
      this.tile.position,
      nextStep.position
    );
  }
}

export default class TileState {
  private surroundingEnvironmentsByRadius: {
    [key: string]: SurroundingTileEnvironment;
  };

  private _creep: CreepDecorator;
  private _futureCreep: CreepDecorator;
  private _constructionSite: ConstructionSite;
  private _structure: Structure;

  private readonly modifier: number;

  readonly onCreepChanged: EventHandler<TileState, [CreepDecorator]>;
  readonly onFutureCreepChanged: EventHandler<TileState, [CreepDecorator]>;
  readonly onConstructionSiteChanged: EventHandler<TileState, [ConstructionSite]>;
  readonly onStructureChanged: EventHandler<TileState, [Structure]>;

  readonly popularity = {
    score: 0,
    lastIncreaseTick: 0
  };

  readonly position: RoomPosition;

  private pathsTo: {
    [positionKey: string]: Path;
  };

  road: StructureRoad;
  wall: StructureWall;

  get constructionSite() {
    return this._constructionSite;
  }

  set constructionSite(value: ConstructionSite) {
    this._constructionSite = value;
    this.onConstructionSiteChanged.fire(this._constructionSite);
  }

  get structure() {
    return this._structure;
  }

  set structure(value: Structure) {
    this._structure = value;
    this.onStructureChanged.fire(this._structure);
  }

  get isWalkable() {
    return this.modifier !== TERRAIN_MASK_WALL && !this.structure;
  }

  get creep() {
    return this._creep;
  }

  get futureCreep() {
    return this._futureCreep;
  }

  set creep(value: CreepDecorator) {
    this._creep = value;

    if (!value)
      this._futureCreep = null;

    this.onCreepChanged.fire(value);
  }

  set futureCreep(value: CreepDecorator) {
    this._futureCreep = value;
    this.onFutureCreepChanged.fire(value);
  }

  public get isOccupied() {
    return !!this.creep || !!this.futureCreep;
  }

  constructor(public readonly terrain: TerrainDecorator, x: number, y: number) {
    this.position = terrain.room.room.getPositionAt(x, y);
    this.modifier = terrain.terrain.get(x, y);

    this.resetPaths();
    this.resetEnvironments();

    this.onCreepChanged = new EventHandler(this);
    this.onFutureCreepChanged = new EventHandler(this);
    this.onStructureChanged = new EventHandler(this);
    this.onConstructionSiteChanged = new EventHandler(this);

    terrain.onChange.addListener(() => this.resetPaths(), false);

    this.onStructureChanged.addListener(() => this.resetEnvironments(), false);
    this.onConstructionSiteChanged.addListener(() => this.resetEnvironments(), false);
  }

  private resetPaths() {
    if(this.pathsTo) {
      for(let key in this.pathsTo) {
        let path = this.pathsTo[key];
        if(path.origin !== this)
          continue;

        delete this.pathsTo[key];
        for(let step of path.nextTiles) {
          delete step.pathsTo[key];
        }
      }
    }

    this.pathsTo = Object.create(null);
  }

  private resetEnvironments() {
    for (let radius in this.surroundingEnvironmentsByRadius)
      this.surroundingEnvironmentsByRadius[radius].dispose();

    this.surroundingEnvironmentsByRadius = Object.create(null);
  }

  getSurroundingEnvironment(radius: number, minimumRadius: number, avoidRoads: boolean = false) {
    let environmentKey = radius + '-' + minimumRadius + '-' + avoidRoads;
    if (typeof this.surroundingEnvironmentsByRadius[environmentKey] !== "undefined")
      return this.surroundingEnvironmentsByRadius[environmentKey];

    //TODO: for all areas larger than radius 1, use only every 2nd tile, so that every creep can move past eachother.

    let areas = this.terrain.room.room.lookForAtArea(
      LOOK_TERRAIN,
      this.position.y - radius,
      this.position.x - radius,
      this.position.y + radius,
      this.position.x + radius,
      true) as LookAtResultWithPos[];

    let tiles = areas
      .filter(x => x.x !== this.position.x || x.y !== this.position.y)
      .filter(x => x.terrain !== "wall")
      .map(t => this.terrain.getTileAt(t.x, t.y));

    this.surroundingEnvironmentsByRadius[environmentKey] = new SurroundingTileEnvironment(radius, minimumRadius, this, tiles, avoidRoads);
    return this.surroundingEnvironmentsByRadius[environmentKey];
  }

  getTileInDirection(direction: Direction): TileState {
    let position = Coordinates.coordinatesFromDirection(direction);
    return this.terrain.getTileAt(this.position.x + position.x, this.position.y + position.y);
  }

  getPathTo(targetPosition: RoomPosition) {
    let positionIndex = Coordinates.roomPositionToNumber(targetPosition.x, targetPosition.y);
    let key = positionIndex;
    let path = this.pathsTo[key];

    if (typeof path !== "undefined")
      return path;

    let nextStep: TileState;
    let nextTiles: Array<TileState>;

    let steps = this.terrain.room.findWalkablePath(this.position, targetPosition);
    if (steps.length === 0) {
      nextStep = null;
      nextTiles = [];
    } else {
      nextTiles = steps.map(step => this.terrain.getTileAt(step.x, step.y));

      let firstStep = steps[0];
      nextStep = this.terrain.getTileAt(firstStep.x, firstStep.y);
    }

    let target = this.terrain.getTileAt(targetPosition);

    let getPathObject = (ownerTile: TileState) => {
      let path = new Path(ownerTile);
      path.nextTiles = nextTiles;
      path.target = target;
      path.origin = this;

      return path;
    };

    this.pathsTo[key] = !nextStep ? null : getPathObject(this);

    while(nextTiles[0]) {
      let step = nextTiles[0];
      if(step.pathsTo[key])
        break;

      nextTiles = nextTiles.slice(1);

      step.pathsTo[key] = getPathObject(step);
    }

    return this.pathsTo[key];
  }
}
