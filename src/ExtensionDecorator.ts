import RoomDecorator from 'RoomDecorator';
import SurroundingTileEnvironment from 'terrain/SurroundingTileEnvironment';


export default class ExtensionDecorator {
    transferEnvironment: SurroundingTileEnvironment;

    readonly id: string;

    get energyCapacity() {
        return this.extension.energyCapacity;
    }

    get energy() {
        return this.extension.energy;
    }

    get needsEnergy() {
        return this.energy < this.energyCapacity && this.transferEnvironment.occupiedTiles.length === 0;
    }

    constructor(
        public readonly room: RoomDecorator,
        public readonly extension: StructureExtension)
    {
        this.id = extension.id;
    }

    initialize() {
        let tile = this.room.terrain.getTileAt(this.extension.pos);
        this.transferEnvironment = tile.getSurroundingEnvironment(1, 1, 1);
    }
};
