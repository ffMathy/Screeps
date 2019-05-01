import RoomDecorator from 'RoomDecorator';
import profile from 'profiler';
import SurroundingTileEnvironment from 'terrain/SurroundingTileEnvironment';

@profile
export default class ControllerDecorator {
  readonly upgradeEnvironment: SurroundingTileEnvironment;

  constructor(
    public readonly room: RoomDecorator,
    public readonly controller: Controller) {

    if (controller != null) {
      let tile = room.terrain.getTileAt(controller.pos);
      this.upgradeEnvironment = tile.getSurroundingEnvironment(5, 1);
    }
  }
};
