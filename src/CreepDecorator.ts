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

  private strategy: CreepStrategy;
  private lastPosition: RoomPosition;

  get tile() {
    return this._tile;
  }

  set futureTile(value: TileState) {
    if(this._futureTile)
      this._futureTile.futureCreep = null;

    this._futureTile = value;

    if(this._futureTile)
      this._futureTile.futureCreep = this;
  }

  public get memory(): CreepMemory {
    return this.creep.memory;
  }

  constructor(
    private readonly game: GameDecorator,
    public creep: Creep)
  {
    this.strategy = null;

    this.room = game.rooms.fromCreep(creep);
    this.room.creeps.add(this);
  }

  setStrategy(strategy: CreepStrategy) {
    this.strategy = strategy;
    this.memory.strategy = strategy ? strategy.name : '';
    if(strategy)
      this.say(strategy.name, true);
  }

  updateRoom() {
    this.room.creeps.remove(this);
    this.room = this.game.rooms.fromCreep(this.creep);
    this.room.creeps.add(this);
  }

  say(message: string, toPublic?: boolean): number {
    return this.creep.say(message, toPublic);
  }

  tick() {
    const oldCreep = this.creep;
    if(this.creep)
      this.creep = Game.creeps[this.creep.name];

    if(!this.creep || oldCreep.ticksToLive <= 3) {
      if(this._tile)
        this._tile.creep = null;

      this.futureTile = null;

      this.room.creeps.remove(this);
      if(oldCreep && oldCreep.name)
        delete Memory.creeps[oldCreep.name];

      return;
    }

    if(this.creep.room.name !== oldCreep.room.name)
      this.updateRoom();

    if(!this._tile || this.creep.pos.x !== this._tile.position.x || this.creep.pos.y !== this._tile.position.y) {
      if(this._tile)
        this._tile.creep = null;

      this._tile = this.room.terrain.getTileAt(this.creep.pos.x, this.creep.pos.y);
      this._tile.creep = this;
    }

    if(!this.lastPosition)
      this.lastPosition = this.creep.pos;

    if(!this.strategy)
      return;

    if(this.lastPosition.x !== this.creep.pos.x || this.lastPosition.y !== this.creep.pos.y)
      this.room.terrain.increaseTilePopularity(this.creep.pos.x, this.creep.pos.y);

    let newStrategy = this.strategy.tick();
    if(typeof newStrategy === "function") {
      let newStrategyObject = newStrategy(this);
      if(newStrategyObject === null) {
        this.room.creeps.setIdle(this);
      } else if(typeof newStrategyObject !== "undefined") {
        this.setStrategy(newStrategyObject);
      }
    } else if(newStrategy === null) {
      this.room.creeps.setIdle(this);
    } else if(typeof newStrategy !== "undefined") {
      this.setStrategy(newStrategy);
    }
  }
}
