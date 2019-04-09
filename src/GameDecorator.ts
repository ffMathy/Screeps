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

  constructor(public readonly game: Game) {
    this.rooms = new RoomsDecorator(this);
    this.creeps = new CreepsDecorator(this);
    this.resources = new Resources(this.rooms);

    this.availableCpu = game.cpu.limit;
  }

  tick() {
    this.rooms.tick();
    this.creeps.tick();
    this._usedCpu = Game.cpu.getUsed();
  }
}
