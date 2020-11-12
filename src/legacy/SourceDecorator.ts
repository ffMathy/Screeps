import RoomDecorator from 'RoomDecorator';

import SurroundingTileEnvironment from 'terrain/SurroundingTileEnvironment';


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
