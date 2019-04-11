import SpawnDecorator from "SpawnDecorator";
import GameDecorator from "GameDecorator";
import RoomsDecorator from "RoomsDecorator";
import CreepDecorator from "CreepDecorator";
import Arrays from "helpers/Arrays";
import TerrainDecorator from "TerrainDecorator";

export default class RoomDecorator {
    public sources: Source[];
    public constructionSites: ConstructionSite[];
    public spawns: SpawnDecorator[];
    public creeps: CreepDecorator[];
    public terrain: TerrainDecorator;

    private _lastControllerLevel: number;

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
      public readonly roomName: string)
    {
      this.creeps = [];

      this._isPopulationMaintained = false;

      this._unexploredNeighbourNameOffset = 0;
      this._unexploredNeighbourNames = [];
      this._neighbouringRoomsByDirection = {};
      this._allNeighbouringRooms = [];
    }

    private refreshPopulationMaintenanceStatus() {
        this._isPopulationMaintained = this.creeps.length >= 15;
    }

    createConstructionSite(x: number, y: number, structureType: string): number {
      let returnValue = this.room.createConstructionSite(x, y, structureType);
      if(returnValue === 0)
        this.refreshConstructionSites();

      return returnValue;
    }

    initialize() {
      this.terrain = new TerrainDecorator(this, (this.game.game.map as any).getRoomTerrain(this.roomName));

      for(let creep of this.game.creeps.all) {
        if(creep.creep.room.name === this.roomName)
          this.addCreep(creep);
      }

      this.sources = this.isClaimed ? this.room.find(FIND_SOURCES) : [];

      this.refresh();

      if(!this.isPopulationMaintained)
        Arrays.add(this.rooms.lowPopulation, this);
    }

    addCreep(creep: CreepDecorator) {
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

    private refreshConstructionSites() {
      if(!this.isClaimed)
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

    //TODO: optimize this
    getTransferrableStructures(): (Structure|Spawn)[] {
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

    private spiral(n) {
      var r = Math.floor((Math.sqrt(n + 1) - 1) / 2) + 1;
      var p = (8 * r * (r - 1)) / 2;
      var en = r * 2;
      var a = (1 + n - p) % (r * 8);

      var pos = [0, 0, r];
      switch (Math.floor(a / (r * 2))) {
          case 0:
              {
                  pos[0] = a - r;
                  pos[1] = -r;
              }
              break;
          case 1:
              {
                  pos[0] = r;
                  pos[1] = (a % en) - r;

              }
              break;
          case 2:
              {
                  pos[0] = r - (a % en);
                  pos[1] = r;
              }
              break;
          case 3:
              {
                  pos[0] = -r;
                  pos[1] = r - (a % en);
              }
              break;
      }
      return { x: pos[0], y: pos[1] };
  }

    private constructStructures() {
      this._lastControllerLevel = this.room.controller.level;

      let structures = (this.room.find(FIND_STRUCTURES) as Structure[]).filter(x => x.structureType !== STRUCTURE_SPAWN && x.structureType !== STRUCTURE_ROAD);

      let typesToBuild = [STRUCTURE_EXTENSION];
      for(let typeToBuild of typesToBuild) {
        const structuresOfType = structures.filter(s => s.structureType === typeToBuild);
        const constructionSitesOfType = this.constructionSites.filter(x => x.structureType === typeToBuild);

        let totalAvailable = 0;
        for(let level in CONTROLLER_STRUCTURES[typeToBuild]) {
          if(+level > this.room.controller.level)
            break;

          totalAvailable += +CONTROLLER_STRUCTURES[typeToBuild][level];
        }

        let countBuilt = structuresOfType.length + constructionSitesOfType.length;
        console.log('building', this.roomName, countBuilt, totalAvailable);

        let offset = structures.length;
        while(countBuilt < totalAvailable) {
          let currentOffset = offset;
          let position = this.spiral(currentOffset);
          position.x += this.room.controller.pos.x;
          position.y += this.room.controller.pos.y;

          offset += 2;

          let terrain = this.terrain.getModifier(position.x, position.y);
          if(terrain === TERRAIN_MASK_WALL)
            continue;

          let buildResult = this.room.createConstructionSite(position.x, position.y, typeToBuild);
          if(buildResult === 0) {
            console.log('built', this.roomName, currentOffset, position.x, position.y);

            countBuilt++;
          } else {
            console.log('build error', buildResult);
          }
        }
      }

      this.refresh();
    }

    tick() {
      if(this.room && this.room.controller) {
        if(this.room.controller.level !== this._lastControllerLevel) {
          this.constructStructures();
        }

        if(this.isPopulationMaintained) {
          Arrays.add(this.rooms.lowPopulation, this);
          this.sayAt(this.room.controller, '😃');
        } else {
          Arrays.remove(this.rooms.lowPopulation, this);
          this.sayAt(this.room.controller, '😟');
        }
      }

      for(let spawn of this.spawns)
        spawn.tick();
    }
}
