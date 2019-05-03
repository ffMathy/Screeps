import RoomDecorator from 'RoomDecorator';
import profile from 'profiler';
import SurroundingTileEnvironment from 'terrain/SurroundingTileEnvironment';

@profile
export default class SourceDecorator {
    harvestEnvironment: SurroundingTileEnvironment;

    constructor(
        public readonly room: RoomDecorator,
        public readonly source: Source)
    {
    }

    initialize() {
        let tile = this.room.terrain.getTileAt(this.source.pos);
        this.harvestEnvironment = tile.getSurroundingEnvironment(1, 1);
    }
};
