import SpawnDecorator from "SpawnDecorator";
import GameDecorator from "GameDecorator";
import RoomsDecorator from "RoomsDecorator";

export default class RoomDecorator {
    public sources: Source[];
    public constructionSites: ConstructionSite[];
    public spawns: SpawnDecorator[];

    private _neighbouringRoomsByDirection: {[direction: string]: RoomDecorator};
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
      private readonly roomName: string)
    {
      this._unexploredNeighbourNameOffset = 0;
      this._unexploredNeighbourNames = [];
      this._neighbouringRoomsByDirection = {};
      this._allNeighbouringRooms = [];

      this.refresh();
    }

    refresh() {
      this.sources = this.isClaimed ? this.room.find(FIND_SOURCES) : [];
      this.constructionSites = this.isClaimed ? this.room.find(FIND_CONSTRUCTION_SITES) : [];
      this.spawns = this.isClaimed ? this.room
        .find(FIND_MY_SPAWNS)
        .map((x: Spawn) => new SpawnDecorator(this.game, this, x)) : [];

      if(this.spawns.length === 0)
        this.spawns.push(new SpawnDecorator(this.game, this, null));
    }

    getRandomUnexploredNeighbourName() {
      if(this._unexploredNeighbourNames.length === 0)
        return null;

      return this._unexploredNeighbourNames[this._unexploredNeighbourNameOffset++ % this._unexploredNeighbourNames.length];
    }

    detectNeighbours() {
      if(!this.isClaimed)
        return;

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
        { align: 'left', opacity: 0.8 });
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
      for(let spawn of this.spawns)
        spawn.tick();
    }
}
