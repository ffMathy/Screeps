import RoomDecorator from 'RoomDecorator';
import profile from 'profiler';
import SurroundingTileEnvironment from 'terrain/SurroundingTileEnvironment';

@profile
export default class SourceDecorator {
    readonly harvestEnvironment: SurroundingTileEnvironment;

    constructor(
        public readonly room: RoomDecorator,
        public readonly source: Source)
    {
        let tile = room.terrain.getTileAt(source.pos);
        this.harvestEnvironment = tile.getSurroundingEnvironment(1, 1);
    }
};
