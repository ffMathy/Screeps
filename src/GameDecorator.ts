import RoomsDecorator from "RoomsDecorator";
import CreepDecorator from "CreepDecorator";

import DeferHelper from "helpers/DeferHelper";


export default class GameDecorator {
  public readonly rooms: RoomsDecorator;

  private static _instance: GameDecorator;

  public get cpuUsedPercentage() {
    return Game.cpu.getUsed() / Game.cpu.tickLimit;
  }

  public get tickCount() {
    return Game.time;
  }

  public static get instance() {
    if(!this._instance)
      this._instance = new GameDecorator(Game);

    return this._instance;
  }

  constructor(public game: Game) {
    this.rooms = new RoomsDecorator(this);

    this.rooms.initialize();

    for(let name in game.creeps) {
      this.rooms.detectRoom(game.creeps[name].room.name).creeps.add(
        new CreepDecorator(this, Game.creeps[name]));
    }
  }

  tick() {
    this.game = Game;

    DeferHelper.run();

    this.rooms.tick();
  }
}
