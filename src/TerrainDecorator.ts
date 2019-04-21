import RoomDecorator from "RoomDecorator";

declare interface Terrain {
  get(x: number, y: number): number
}

export default class TerrainDecorator {
  private readonly tilePopularity: Array<number>;
  private readonly tileLastIncreaseTick: Array<number>;

  constructor(
    public readonly room: RoomDecorator,
    public readonly terrain: Terrain
  ) {
    this.tilePopularity = new Array(50 * 50);
    this.tileLastIncreaseTick = new Array(50 * 50);
  }

  getModifier(x: number, y: number) {
    return this.terrain.get(x, y);
  }

  getTilePopularity(x: number, y: number) {
    let i = x + 50*y;
    if(!this.tilePopularity[i])
      return 0;

    let tickDelta = Game.time - this.tileLastIncreaseTick[i];
    return Math.max(0, this.tilePopularity[i] - tickDelta);
  }

  increaseTilePopularity(x: number, y: number) {
    if(!this.room.room || !this.room.room.controller || this.room.room.controller.level < 2)
      return;

    let i = x + 50*y;
    if(!this.tilePopularity[i])
      this.tilePopularity[i] = 0;

    this.tileLastIncreaseTick[i] = Game.time;

    const maximumPopularity = 500;

    let popularity = Math.min(maximumPopularity, this.tilePopularity[i]+5);
    if(popularity === maximumPopularity) {
      this.room.createConstructionSite(x, y, STRUCTURE_ROAD);
      popularity = 1;
    }

    this.tilePopularity[i] = popularity;
  }
}
