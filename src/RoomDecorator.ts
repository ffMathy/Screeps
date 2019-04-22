import SpawnDecorator from "SpawnDecorator";
import GameDecorator from "GameDecorator";
import RoomsDecorator from "RoomsDecorator";
import CreepDecorator from "CreepDecorator";
import Arrays from "helpers/Arrays";
import TerrainDecorator from "TerrainDecorator";
import StrategyPickingRoomStrategy from "strategies/room/StrategyPickingRoomStrategy";

export interface RoomStrategy {
  readonly name: string;

  tick();
}

export default class RoomDecorator {
  public sources: Source[];
  public constructionSites: ConstructionSite[];
  public spawns: SpawnDecorator[];
  public creeps: CreepDecorator[];
  public terrain: TerrainDecorator;

  public ticks: number;

  private strategy: RoomStrategy;

  private _neighbouringRoomsByDirection: { [direction: string]: RoomDecorator };
  private _allNeighbouringRooms: RoomDecorator[];

  private _unexploredNeighbourNameOffset: number;
  private _unexploredNeighbourNames: string[];

  private _isPopulationMaintained: boolean;

  public get isPopulationMaintained() {
    return this._isPopulationMaintained;
  }

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
    public readonly roomName: string) {
    this.creeps = [];
    this.ticks = 0;

    this._isPopulationMaintained = false;

    this._unexploredNeighbourNameOffset = 0;
    this._unexploredNeighbourNames = [];
    this._neighbouringRoomsByDirection = {};
    this._allNeighbouringRooms = [];

    this.strategy = new StrategyPickingRoomStrategy(this);
  }

  private refreshPopulationMaintenanceStatus() {
    this._isPopulationMaintained = this.creeps.length >= 5;

    if(this._isPopulationMaintained || !this.room || !this.room.controller) {
      Arrays.remove(this.rooms.lowPopulation, this);

      if(this.room)
        this.sayAt(this.room.controller, '😃');
    } else {
      Arrays.add(this.rooms.lowPopulation, this);

      if(this.room)
        this.sayAt(this.room.controller, '😟');
    }
  }

  createConstructionSite(x: number, y: number, structureType: string): number {
    let returnValue = this.room.createConstructionSite(x, y, structureType);
    if (returnValue === 0)
      this.refreshConstructionSites();

    return returnValue;
  }

  initialize() {
    this.terrain = new TerrainDecorator(this, (this.game.game.map as any).getRoomTerrain(this.roomName));

    for (let creep of this.game.creeps.all) {
      if (creep.creep.room.name === this.roomName)
        this.addCreep(creep);
    }

    this.sources = this.isClaimed ? this.room.find(FIND_SOURCES) : [];

    this.refresh();
  }

  addCreep(creep: CreepDecorator) {
    if (this.creeps.indexOf(creep) === -1) {
      this.creeps.push(creep);

      this.refreshPopulationMaintenanceStatus();
    }
  }

  removeCreep(creep: CreepDecorator) {
    if (this.creeps.indexOf(creep) > -1) {
      this.creeps.splice(this.creeps.indexOf(creep), 1);
      this.refreshPopulationMaintenanceStatus();
    }
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

    this.refreshPopulationMaintenanceStatus();
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
    this.room.visual.text(
      text,
      object.pos.x + 1,
      object.pos.y,
      { align: 'left', opacity: 1 });
  }

  //TODO: optimize this
  getTransferrableStructures(): (Structure | Spawn)[] {
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
    this.strategy.tick();
    this.ticks++;
  }
}
