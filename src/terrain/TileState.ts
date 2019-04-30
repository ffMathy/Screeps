import CreepDecorator from "CreepDecorator";
import Coordinates, { Direction } from "helpers/Coordinates";
import EventHandler from "../helpers/EventHandler";
import SurroundingTileEnvironment from "terrain/SurroundingTileEnvironment";
import TerrainDecorator from "./TerrainDecorator";

export default class TileState {
  private surroundingEnvironmentsByRadius: {
    [key: string]: SurroundingTileEnvironment;
  };

  private _creep: CreepDecorator;
  private _futureCreep: CreepDecorator;

  private readonly modifier: number;

  readonly onCreepChanged: EventHandler<TileState, [CreepDecorator]>;
  readonly onFutureCreepChanged: EventHandler<TileState, [CreepDecorator]>;

  readonly popularity = {
    score: 0,
    lastIncreaseTick: 0
  };

  readonly position: RoomPosition;

  private pathsTo: {
    [positionIndex: number]: {
      distance: number;
      nextStep: TileState;
      nextDirection: Direction;
      nextSteps: Array<PathStep>;
    };
  };

  constructionSite: ConstructionSite;
  road: StructureRoad;
  wall: StructureWall;
  structure: Structure;

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
    this.position = new RoomPosition(x, y, terrain.room.roomName);
    this.modifier = terrain.terrain.get(x, y);

    this.surroundingEnvironmentsByRadius = {};

    this.onCreepChanged = new EventHandler(this);
    this.onFutureCreepChanged = new EventHandler(this);

    this.pathsTo = {};
    terrain.onChange.addListener(() => this.pathsTo = {}, false);
  }

  getSurroundingEnvironment(radius: number, minimumRadius: number, avoidRoads: boolean = false) {
    let environmentKey = radius + '-' + minimumRadius;
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
    let positionIndex = Coordinates.roomPositionToNumber(targetPosition);
    let path = this.pathsTo[positionIndex];

    if (typeof path !== "undefined")
      return path;

    let nextStep: TileState;
    let nextDirection: Direction;
    let distance: number;
    let nextSteps: Array<PathStep>;

    let steps = this.terrain.room.findWalkablePath(this.position, targetPosition);
    if (steps.length === 0) {
      nextDirection = null;
      nextStep = null;
      distance = null;
      nextSteps = [];
    } else {
      nextSteps = steps;

      let firstStep = steps[0];
      nextStep = this.terrain.getTileAt(firstStep.x, firstStep.y);

      nextDirection = Coordinates.directionFromCoordinates(this.position, nextStep.position);
      distance = steps.length;
    }

    this.pathsTo[positionIndex] = !nextStep ? null : {
      distance: distance,
      nextStep: nextStep,
      nextDirection: nextDirection,
      nextSteps: nextSteps
    };

    return this.pathsTo[positionIndex];
  }
}
