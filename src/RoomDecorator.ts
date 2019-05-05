import SpawnDecorator from "SpawnDecorator";
import GameDecorator from "GameDecorator";
import RoomsDecorator from "RoomsDecorator";
import TerrainDecorator from "terrain/TerrainDecorator";
import ConstructStructuresRoomStrategy from "strategies/room/ConstructStructuresRoomStrategy";
import CreepsDecorator from "CreepsDecorator";
import profile from "profiler";
import SourceDecorator from "SourceDecorator";
import ControllerDecorator from "ControllerDecorator";
import { Direction } from "helpers/Coordinates";
import TileState from "terrain/TileState";
import CreepDecorator from "CreepDecorator";
import Arrays from "helpers/Arrays";

export interface RoomStrategy {
  readonly name: string;

  tick();
}

interface NeighbouringRoom {
  direction: Direction,
  room: RoomDecorator,
  isClaimed: boolean,
  isBeingExploredBy: CreepDecorator,
  exits: TileState[]
}

@profile
export default class RoomDecorator {
  public sources: SourceDecorator[];
  public constructionSites: ConstructionSite[];
  public spawns: SpawnDecorator[];
  public terrain: TerrainDecorator;
  public structures: Structure[];
  public controller: ControllerDecorator;
  public exits: TileState[];

  public readonly visuals: ((visual: RoomVisual) => RoomVisual)[];

  public readonly creeps: CreepsDecorator;

  private strategy: RoomStrategy;

  private lastRefreshTick: number;

  private _neighbouringRoomsByDirection: { [direction: number]: NeighbouringRoom };
  private _allNeighbouringRooms: NeighbouringRoom[];

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

    this.exits = [];
    this.constructionSites = [];
    this.visuals = [];
    this.structures = [];
    this.sources = [];

    this._neighbouringRoomsByDirection = {};
    this._allNeighbouringRooms = [];
  }

  findWalkablePath(fromPos: RoomPosition, toPos: RoomPosition, opts?: FindPathOpts): PathStep[] {
    if(!opts)
      opts = {};

    opts.ignoreCreeps = true;

    let spotTiles = this.terrain
      .spotTiles
      .map(x => x.position);
    let tilesToIgnore = [...spotTiles, ...this.exits.map(x => x.position)];

    opts.costCallback = (_roomName, costMatrix) => {
      for(let structure of this.structures)
        costMatrix.set(structure.pos.x, structure.pos.y, 255);

      for(let avoidPosition of tilesToIgnore)
        costMatrix.set(avoidPosition.x, avoidPosition.y, 100);

      return costMatrix;
    };

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

    this.refreshNow();

    for(let source of this.sources)
      source.initialize();

    this.controller.initialize();

    this.creeps.initialize();

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
      this.constructionSites = this.room.find(FIND_CONSTRUCTION_SITES) || [];
      for(let constructionSite of this.constructionSites) {
        let tile = this.terrain.getTileAt(constructionSite.pos);
        tile.constructionSite = constructionSite;
      }

      this.structures = this.room.find(FIND_STRUCTURES) || [];
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

      for(let spawn of this.spawns)
        spawn.initialize();

      this.terrain.onChange.fire();
    }
  }

  refresh() {
    this.refreshNow();
    // DeferHelper.add(() => this.refreshNow());
  }

  private getExitsInDirection(direction: Direction) {
    let exits = new Array<TileState>();
    for(let i=0;i<50;i++) {
      let position: { x: number, y: number };

      switch(direction) {
        case Direction.TOP_LEFT:
        case Direction.LEFT:
        case Direction.BOTTOM_LEFT:
          position = { x: 0, y: i };
          break;

        case Direction.TOP:
          position = { x: i, y: 0 };
          break;

        case Direction.TOP_RIGHT:
        case Direction.RIGHT:
        case Direction.BOTTOM_RIGHT:
          position = { x: 49, y: i };
          break;

        case Direction.BOTTOM:
          position = { x: i, y: 49 };
          break;
      }

      let tile = this.terrain.getTileAt(this.room.getPositionAt(position.x, position.y));
      if(tile.isWalkable)
        Arrays.add(exits, tile);
    }

    return exits;
  }

  detectNeighbours() {
    if (!this.isClaimed)
      return;

    this._neighbouringRoomsByDirection = {};
    this._allNeighbouringRooms.splice(0);

    let exits = this.game.game.map.describeExits(this.room.name);
    for (let direction in exits) {
      let roomName = exits[direction];

      let roomDecorator = new RoomDecorator(this.game, this.rooms, roomName);
      if (Game.map.isRoomAvailable(roomName)) {
        let neighbouringRoom: NeighbouringRoom = {
          direction: +direction,
          isClaimed: roomDecorator.isClaimed,
          isBeingExploredBy: null,
          room: roomDecorator,
          exits: this.getExitsInDirection(+direction)
        };

        this._neighbouringRoomsByDirection[+direction] = neighbouringRoom;
        this._allNeighbouringRooms.push(neighbouringRoom);

        for(let exit of neighbouringRoom.exits)
          Arrays.add(this.exits, exit);
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

  private renderVisuals() {
    try {
      if(this.room && this.room.visual) {
        for(let visual of this.visuals) {
          visual(this.room.visual);
          if(this.room.visual.getSize() >= 512000)
            break;
        }
      }
    } catch(ex) {
      console.log('room visual error');
      throw ex;
    }
  }

  tick() {
    this.renderVisuals();

    this.strategy.tick();
    this.creeps.tick();

    for(let spawn of this.spawns)
      spawn.tick();
  }
}
