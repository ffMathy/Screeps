import RoomDecorator from 'RoomDecorator';
import profile from 'profiler';
import SurroundingTileEnvironment from 'terrain/SurroundingTileEnvironment';

@profile
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
