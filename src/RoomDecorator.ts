import SpawnDecorator from "SpawnDecorator";
import GameDecorator from "GameDecorator";
import RoomsDecorator from "RoomsDecorator";
import TerrainDecorator from "terrain/TerrainDecorator";
import ConstructStructuresRoomStrategy from "strategies/room/ConstructStructuresRoomStrategy";
import CreepsDecorator from "CreepsDecorator";
import profile from "profiler";
import DeferHelper from "helpers/DeferHelper";
import SourceDecorator from "SourceDecorator";
import ControllerDecorator from "ControllerDecorator";

export interface RoomStrategy {
  readonly name: string;

  tick();
}

@profile
export default class RoomDecorator {
  public sources: SourceDecorator[];
  public constructionSites: ConstructionSite[];
  public spawns: SpawnDecorator[];
  public terrain: TerrainDecorator;
  public structures: Structure[];
  public controller: ControllerDecorator;

  public readonly visuals: ((visual: RoomVisual) => RoomVisual)[];

  public readonly creeps: CreepsDecorator;

  private strategy: RoomStrategy;

  private lastRefreshTick: number;

  private _neighbouringRoomsByDirection: { [direction: string]: RoomDecorator };
  private _allNeighbouringRooms: RoomDecorator[];

  private _unexploredNeighbourNameOffset: number;
  private _unexploredNeighbourNames: string[];

  public get unexploredNeighbourNames() {
    return this._unexploredNeighbourNames;
  }

  public get neighbours() {
    return this._allNeighbouringRooms;
  }

  public get room() {
    return this.game.game.rooms[this.roomName];
  }

  public get isClaimed() {
    return !!this.room;
  }

  constructor(
    private readonly game: GameDecorator,
    private readonly rooms: RoomsDecorator,
    public readonly roomName: string)
  {
    this.creeps = new CreepsDecorator(rooms, this);
    this.constructionSites = [];
    this.visuals = [];

    this._unexploredNeighbourNameOffset = 0;
    this._unexploredNeighbourNames = [];
    this._neighbouringRoomsByDirection = {};
    this._allNeighbouringRooms = [];
  }

  findWalkablePath(fromPos: RoomPosition, toPos: RoomPosition, opts?: FindPathOpts): PathStep[] {
    if(!opts)
      opts = {};

    opts.ignoreCreeps = true;
    opts.ignoreDestructibleStructures = false;
    opts.ignoreRoads = false;

    if(opts.avoid) {
      let avoid = opts.avoid;
      delete opts.avoid;

      opts.costCallback = (_roomName, costMatrix) => {
        for(let avoidPosition of avoid)
          costMatrix.set(avoidPosition.x, avoidPosition.y, 255);

        return costMatrix;
      }
    }

    let path = this.room.findPath(fromPos, toPos, opts);
    if(path.length > 0) {
      let lastStep = path[path.length-1];
      let lastTile = this.terrain.getTileAt(lastStep.x, lastStep.y);
      if(!lastTile.isWalkable)
        path.splice(path.length-1, 1);
    }

    return path;
  }

  createConstructionSites(positions: RoomPosition[], structureType: string) {
    let countBuilt = 0;
    for(let position of positions) {
      let tile = this.terrain.getTileAt(position);
      if(tile.isWalkable) {
        if(this.room.createConstructionSite(position, structureType) === OK)
          countBuilt++;
      }
    }

    if(countBuilt > 0)
      this.refresh();

    return countBuilt;
  }

  initialize() {
    this.terrain = new TerrainDecorator(this, (this.game.game.map as any).getRoomTerrain(this.roomName));
    this.controller = new ControllerDecorator(this, this.isClaimed ? this.room.controller : null);
    this.sources = this.isClaimed ?
      this.room
        .find(FIND_SOURCES)
        .map((x: Source) => new SourceDecorator(
          this,
          x
        )) : [];

    this.creeps.initialize()

    this.refreshNow();
    this.strategy = new ConstructStructuresRoomStrategy(this);
  }

  private refreshNow() {
    if(this.lastRefreshTick && Game.time <= this.lastRefreshTick)
      return;

    this.lastRefreshTick = Game.time;

    if (!this.isClaimed) {
      this.spawns = [];
      this.constructionSites = [];
    } else {
      this.constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
      for(let constructionSite of this.constructionSites) {
        let tile = this.terrain.getTileAt(constructionSite.pos);
        tile.constructionSite = constructionSite;
      }

      this.structures = this.room.find(FIND_STRUCTURES);
      for(let structure of this.structures) {
        let tile = this.terrain.getTileAt(structure.pos);
        if(structure.structureType === STRUCTURE_WALL) {
          tile.wall = structure as StructureWall;
        } else if(structure.structureType === STRUCTURE_ROAD) {
          tile.road = structure as StructureRoad;
        } else {
          tile.structure = structure;
        }
      }

      this.spawns = this.room
        .find(FIND_MY_SPAWNS)
        .map((x: Spawn) => new SpawnDecorator(this.game, this, x));

      console.log('room refresh');
      this.terrain.onChange.fire();
    }
  }

  refresh() {
    this.refreshNow();
    DeferHelper.add(() => this.refreshNow());
  }

  getRandomUnexploredNeighbourName() {
    if (this._unexploredNeighbourNames.length === 0)
      return null;

    return this._unexploredNeighbourNames[this._unexploredNeighbourNameOffset++ % this._unexploredNeighbourNames.length];
  }

  detectNeighbours() {
    if (!this.isClaimed)
      return;

    this._neighbouringRoomsByDirection = {};
    this._allNeighbouringRooms.splice(0);
    this._unexploredNeighbourNames.splice(0);

    let exits = this.game.game.map.describeExits(this.room.name);
    for (let direction in exits) {
      let roomName = exits[direction];

      if (Game.map.isRoomAvailable(roomName)) {
        let decorator = this.rooms.detectRoom(roomName);

        this._neighbouringRoomsByDirection[direction] = decorator;
        this._allNeighbouringRooms.push(decorator);

        if (!decorator.isClaimed)
          this._unexploredNeighbourNames.push(roomName);
      }
    }
  }

  sayAt(object, text) {
    if(!object || !object.pos || !this.room)
      return;

    if(this.room.visual.getSize() >= 512000)
      return;

    this.room.visual.text(
      text,
      object.pos.x + 1,
      object.pos.y,
      {
        align: 'left',
        opacity: 1
      });
  }

  //TODO: optimize this
  getTransferrableStructures(): (Structure | Spawn | Tower)[] {
    if (!this.room)
      return [];

    return this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN ||
          structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
      }
    });
  }

  setStrategy(strategy: RoomStrategy) {
    this.strategy = strategy;

    if(this.room)
      this.room.memory.strategy = strategy.name;
  }

  tick() {
    if(this.room && this.room.visual) {
      for(let visual of this.visuals) {
        visual(this.room.visual);
        if(this.room.visual.getSize() >= 512000)
          break;
      }
    }

    this.strategy.tick();
    this.creeps.tick();

    for(let spawn of this.spawns)
      spawn.tick();
  }
}
