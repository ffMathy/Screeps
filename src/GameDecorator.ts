import Resources from "Resources";
import RoomsDecorator from "RoomsDecorator";
import CreepDecorator from "CreepDecorator";
import profile from "profiler";

@profile
export default class GameDecorator {
  private _usedCpu: number;

  public readonly availableCpu: number;

  public readonly resources: Resources;
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

  public get usedCpu() {
    return this._usedCpu;
  }

  constructor(public game: Game) {
    this.rooms = new RoomsDecorator(this);
    this.resources = new Resources(this.rooms);

    this.rooms.initialize();
    this.resources.initialize();

    for(let name in game.creeps) {
      this.rooms.detectRoom(game.creeps[name].room.name).creeps.add(
        new CreepDecorator(this, Game.creeps[name]));
    }

    this.availableCpu = game.cpu.limit;
  }

  tick() {
    this.game = Game;

    this.rooms.tick();

    this._usedCpu = Game.cpu.getUsed();
  }
}
