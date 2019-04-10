import Resources from "Resources";
import RoomsDecorator from "RoomsDecorator";
import CreepsDecorator from "CreepsDecorator";

export default class GameDecorator {
  private _usedCpu: number;

  public readonly availableCpu: number;

  public readonly resources: Resources;
  public readonly rooms: RoomsDecorator;
  public readonly creeps: CreepsDecorator;

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
    this.creeps = new CreepsDecorator(this);
    this.rooms = new RoomsDecorator(this);
    this.resources = new Resources(this.rooms);

    this.creeps.initialize();
    this.rooms.initialize();
    this.resources.initialize();

    this.availableCpu = game.cpu.limit;
  }

  tick() {
    this.game = Game;

    this.rooms.tick();
    this.creeps.tick();
    this._usedCpu = Game.cpu.getUsed();
  }
}
