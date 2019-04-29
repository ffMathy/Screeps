import RoomsDecorator from "RoomsDecorator";
import CreepDecorator from "CreepDecorator";
import profile from "profiler";
import EventHandler from "helpers/EventHandler";

@profile
export default class GameDecorator {
  public readonly availableCpu: number;

  public readonly rooms: RoomsDecorator;

  private static _instance: GameDecorator;

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

    this.availableCpu = game.cpu.limit;
  }

  tick() {
    this.game = Game;

    this.rooms.tick();

    EventHandler.runEventHandlers();
  }
}
