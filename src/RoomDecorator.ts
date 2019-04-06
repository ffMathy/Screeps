export default class RoomDecorator {
    public readonly sources: Source[];
    public readonly constructionSites: ConstructionSite[];

    constructor(private room: Room) {
      this.sources = room.find(FIND_SOURCES);
      this.constructionSites = this.room.find(FIND_CONSTRUCTION_SITES);
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
}
