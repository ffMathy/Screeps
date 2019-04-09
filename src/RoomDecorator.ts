import SpawnDecorator from "SpawnDecorator";
import GameDecorator from "GameDecorator";
import RoomsDecorator from "RoomsDecorator";

export default class RoomDecorator {
    public readonly sources: Source[];
    public readonly constructionSites: ConstructionSite[];
    public readonly spawns: SpawnDecorator[];

    private _neighbouringRoomsByDirection: {[direction: string]: RoomDecorator};
    private _allNeighbouringRooms: RoomDecorator[];

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
      this._neighbouringRoomsByDirection = {};
      this._allNeighbouringRooms = [];

      this.sources = this.isClaimed ? this.room.find(FIND_SOURCES) : [];
      this.constructionSites = this.isClaimed ? this.room.find(FIND_CONSTRUCTION_SITES) : [];
      this.spawns = this.isClaimed ? this.room
        .find(FIND_MY_SPAWNS)
        .map((x: Spawn) => new SpawnDecorator(game, this, x)) : [];
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
