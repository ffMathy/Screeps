import SpawnDecorator from "SpawnDecorator";
import GameDecorator from "GameDecorator";
import RoomsDecorator from "RoomsDecorator";
import CreepDecorator from "CreepDecorator";

export default class RoomDecorator {
    public sources: Source[];
    public constructionSites: ConstructionSite[];
    public spawns: SpawnDecorator[];

    public creeps: CreepDecorator[];

    private _neighbouringRoomsByDirection: {[direction: string]: RoomDecorator};
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
      private readonly roomName: string)
    {
      this._isPopulationMaintained = false;
      this.creeps = [];

      this._unexploredNeighbourNameOffset = 0;
      this._unexploredNeighbourNames = [];
      this._neighbouringRoomsByDirection = {};
      this._allNeighbouringRooms = [];
    }

    private refreshPopulationMaintenanceStatus() {
        this._isPopulationMaintained = this.creeps.length >= 15;
    }

    initialize() {
      for(let creep of this.game.creeps.all) {
        if(creep.creep.room.name === this.roomName)
          this.addCreep(creep);
      }

      this.refresh();
    }

    addCreep(creep: CreepDecorator) {
      //console.log('add creep', creep.creep.name, this.roomName);

      if(this.creeps.indexOf(creep) === -1) {
        this.creeps.push(creep);

        this.refreshPopulationMaintenanceStatus();
      }
    }

    removeCreep(creep: CreepDecorator) {
      if(this.creeps.indexOf(creep) > -1) {
        this.creeps.splice(this.creeps.indexOf(creep), 1);
        this.refreshPopulationMaintenanceStatus();
      }
    }

    refresh() {
      this.sources = this.isClaimed ? this.room.find(FIND_SOURCES) : [];
      this.constructionSites = this.isClaimed ? this.room.find(FIND_CONSTRUCTION_SITES) : [];
      this.spawns = this.isClaimed ? this.room
        .find(FIND_MY_SPAWNS)
        .map((x: Spawn) => new SpawnDecorator(this.game, this, x)) : [];

      if(this.spawns.length === 0)
        this.spawns.push(new SpawnDecorator(this.game, this, null));

      this.refreshPopulationMaintenanceStatus();
    }

    getRandomUnexploredNeighbourName() {
      if(this._unexploredNeighbourNames.length === 0)
        return null;

      return this._unexploredNeighbourNames[this._unexploredNeighbourNameOffset++ % this._unexploredNeighbourNames.length];
    }

    detectNeighbours() {
      if(!this.isClaimed)
        return;

      this._neighbouringRoomsByDirection = {};
      this._allNeighbouringRooms.splice(0);
      this._unexploredNeighbourNames.splice(0);

      let exits = this.game.game.map.describeExits(this.room.name);
      for(let direction in exits) {
        let roomName = exits[direction];

        if(Game.map.isRoomAvailable(roomName)) {
          let decorator = this.rooms.detectRoom(roomName);

          this._neighbouringRoomsByDirection[direction] = decorator;
          this._allNeighbouringRooms.push(decorator);

          if(!decorator.isClaimed)
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

    getTransferrableStructures(): Structure[] {
      if(!this.room)
        return [];

      return this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
      });
    }

    tick() {
      //TODO: remove because slow
      this.refreshPopulationMaintenanceStatus();

      if(this.room && this.room.controller) {
        if(this.isPopulationMaintained) {
            this.sayAt(this.room.controller, '😃');
        } else {
            this.sayAt(this.room.controller, '😟');
        }
      }

      for(let spawn of this.spawns)
        spawn.tick();
    }
}
