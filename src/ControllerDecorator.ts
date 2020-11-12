import RoomDecorator from 'RoomDecorator';

import SurroundingTileEnvironment from 'terrain/SurroundingTileEnvironment';


export default class ControllerDecorator {
  upgradeEnvironment: SurroundingTileEnvironment;

  constructor(
    public readonly room: RoomDecorator,
    public readonly controller: StructureController) {
  }

  initialize() {
    if (this.controller != null) {
      let tile = this.room.terrain.getTileAt(this.controller.pos);
      this.upgradeEnvironment = tile.getSurroundingEnvironment(5, 1);
    }
  }
};
