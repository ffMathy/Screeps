import RoomDecorator from 'RoomDecorator';
import GameDecorator from 'GameDecorator';
import { CreepStrategy } from 'strategies/Strategy';
import profile from 'profiler';
import TileState from "terrain/TileState";

export interface CreepMemory {
  strategy: string;
}

@profile
export default class CreepDecorator {
  public room: RoomDecorator;

  private _tile: TileState;
  private _futureTile: TileState;

  private _strategy: CreepStrategy;
  private lastPosition: RoomPosition;

  get tile() {
    return this._tile;
  }

  set futureTile(value: TileState) {
    if (this._futureTile)
      this._futureTile.futureCreep = null;

    this._futureTile = value;

    if (this._futureTile)
      this._futureTile.futureCreep = this;
  }

  get strategy() {
    return this._strategy;
  }

  set strategy(strategy: CreepStrategy) {
    let previousStrategy = this._strategy;

    this._strategy = strategy;
    this.memory.strategy = strategy ? strategy.name : '';
    if (!strategy) {
      this.room.creeps.setIdle(this);
    } else {
      this.say(strategy.name, true);

      if(previousStrategy)
        strategy.tick();
    }
  }

  public get memory(): CreepMemory {
    return this.creep.memory;
  }

  constructor(
    private readonly game: GameDecorator,
    public creep: Creep) {
    this._strategy = null;

    this.room = game.rooms.fromCreep(creep);
    this.room.creeps.add(this);
  }

  updateRoom() {
    console.log('change-room', this.creep.name, this.creep.pos, this.strategy ? this.strategy.name : null);

    this.room.creeps.remove(this);
    this.room = this.game.rooms.fromCreep(this.creep);
    this.room.creeps.add(this);
  }

  say(message: string, toPublic?: boolean): number {
    return this.creep.say(message, toPublic);
  }

  tick() {
    try {
      const oldCreep = this.creep;
      if (this.creep)
        this.creep = Game.creeps[this.creep.name];

      if (!this.creep || oldCreep.ticksToLive <= 3) {
        if (this._tile)
          this._tile.creep = null;

        this.futureTile = null;

        this.room.creeps.remove(this);
        if (oldCreep && oldCreep.name)
          delete Memory.creeps[oldCreep.name];

        return;
      }

      if (!this._strategy) {
        this.creep.say('💤');
        return;
      }

      if (this.creep.room.name !== oldCreep.room.name)
        this.updateRoom();

      if (!this._tile || this.creep.pos.x !== this._tile.position.x || this.creep.pos.y !== this._tile.position.y) {
        if (this._tile)
          this._tile.creep = null;

        this._tile = this.room.terrain.getTileAt(this.creep.pos.x, this.creep.pos.y);
        this._tile.creep = this;
      }

      if (!this.lastPosition)
        this.lastPosition = this.creep.pos;

      if (this.lastPosition.x !== this.creep.pos.x || this.lastPosition.y !== this.creep.pos.y) {
        this.room.terrain.increaseTilePopularity(this.creep.pos.x, this.creep.pos.y);
      }

      if(this.room.creeps.enableStrategyDebugging)
        this.say(this._strategy.name);

      let newStrategy = this._strategy.tick();
      if (typeof newStrategy === "function") {
        let newStrategyObject = newStrategy(this);
        if (typeof newStrategyObject !== "undefined") {
          this.strategy = (newStrategyObject);
        }
      } else if (typeof newStrategy !== "undefined") {
        this.strategy = (newStrategy);
      }
    } catch (ex) {
      console.log(this.creep.name,
        this._strategy && this._strategy.name,
        JSON.stringify(this.creep.pos));
      throw ex;
    }
  }
}
