import SpawnDecorator from "SpawnDecorator";
import GameDecorator from "GameDecorator";
import RoomsDecorator from "RoomsDecorator";
import TerrainDecorator from "terrain/TerrainDecorator";
import ConstructStructuresRoomStrategy from "strategies/room/ConstructStructuresRoomStrategy";
import RoomCreepsDecorator from "RoomCreepsDecorator";
import profile from "profiler";

export interface RoomStrategy {
  readonly name: string;

  tick();
}

@profile
export default class RoomDecorator {
  public sources: Source[];
  public constructionSites: ConstructionSite[];
  public spawns: SpawnDecorator[];
  public terrain: TerrainDecorator;
  public transferrableStructures: (Structure | Spawn | Tower)[];

  public readonly visuals: ((visual: RoomVisual) => RoomVisual)[];

  public readonly creeps: RoomCreepsDecorator;

  private strategy: RoomStrategy;

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
    this.creeps = new RoomCreepsDecorator(rooms, this);
    this.constructionSites = [];
    this.visuals = [];

    this._unexploredNeighbourNameOffset = 0;
    this._unexploredNeighbourNames = [];
    this._neighbouringRoomsByDirection = {};
    this._allNeighbouringRooms = [];
  }

  findPath(fromPos: RoomPosition, toPos: RoomPosition, opts?: FindPathOpts): PathStep[] {
    if(!opts)
      opts = {};

    opts.ignoreCreeps = true;
    opts.ignoreDestructibleStructures = false;
    opts.ignoreRoads = true;

    return this.room.findPath(fromPos, toPos, opts);
  }

  createConstructionSite(x: number, y: number, structureType: string): number {
    let returnValue = this.room.createConstructionSite(x, y, structureType);
    if (returnValue === 0) {
      this.refreshConstructionSites();

      let tile = this.terrain.getTileAt(x, y);
      tile.constructionSite = this.constructionSites.find(t => t.pos.x === x && t.pos.y === y);
    }

    return returnValue;
  }

  initialize() {
    this.terrain = new TerrainDecorator(this, (this.game.game.map as any).getRoomTerrain(this.roomName));
    this.sources = this.isClaimed ? this.room.find(FIND_SOURCES) : [];

    this.creeps.initialize()

    this.refresh();
    this.strategy = new ConstructStructuresRoomStrategy(this);
  }

  private refreshConstructionSites() {
    if (!this.isClaimed)
      return;

    this.constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
  }

  refresh() {
    this.refreshConstructionSites();

    this.spawns = this.isClaimed ? this.room
      .find(FIND_MY_SPAWNS)
      .map((x: Spawn) => new SpawnDecorator(this.game, this, x)) : [];
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
    if(!object || !object.pos)
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
    this.room.memory.strategy = strategy.name;
  }

  tick() {
    if(this.room && this.room.visual) {
      for(let visual of this.visuals)
        visual(this.room.visual);
    }

    this.strategy.tick();
    this.creeps.tick();

    for(let spawn of this.spawns)
      spawn.tick();
  }
}
