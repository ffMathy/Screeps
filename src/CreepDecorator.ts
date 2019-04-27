import RoomDecorator from 'RoomDecorator';
import GameDecorator from 'GameDecorator';
import { CreepStrategy } from 'strategies/Strategy';
import profile from 'profiler';
import { TileState } from 'TerrainDecorator';

export interface CreepMemory {
  reservationId: string;
}

@profile
export default class CreepDecorator {
  public room: RoomDecorator;
  public tile: TileState;

  private strategy: CreepStrategy;
  private lastStrategyTick: number;
  private lastPosition: RoomPosition;

  public get memory(): CreepMemory {
    return this.creep.memory;
  }

  constructor(
    private readonly game: GameDecorator,
    public creep: Creep)
  {
    this.room = game.rooms.fromCreep(creep);
    this.room.creeps.add(this);
    this.strategy = null;
  }

  // moveTo(target: RoomPosition | { pos: RoomPosition; }, opts?: MoveToOpts) {
  //   if(!opts)
  //     opts = {};

  //   opts.visualizePathStyle = { stroke: '#ffffff' };

  //   opts.ignoreRoads = true;
  //   opts.ignoreCreeps = true;
  //   opts.ignoreDestructibleStructures = true;
  //   opts.reusePath = 1000;
  //   opts.noPathFinding = true;
  //   opts.maxRooms = 0;

  //   let moveResult = this.creep.moveTo(target, opts);
  //   if(moveResult === ERR_NOT_FOUND) {
  //     console.log('recalculate', this.creep.name, Game.time);
  //     this.say('recalculate');
  //     opts.noPathFinding = false;
  //     moveResult = this.creep.moveTo(target, opts);
  //   } else if(moveResult !== 0) {
  //     console.log('move error', moveResult);
  //   }

  //   return moveResult;
  // }

  setStrategy(strategy: CreepStrategy) {
    this.strategy = strategy;
    this.lastStrategyTick = this.game.tickCount;
    this.creep.memory.strategy = strategy ? strategy.name : '';
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
      this.game.resources.unreserve(oldCreep);
      this.room.creeps.remove(this);
      delete Memory.creeps[this.creep.name];
      return;
    }

    if(this.creep.room.name !== oldCreep.room.name)
      this.updateRoom();

    if(!this.tile || this.creep.pos.x !== this.tile.position.x || this.creep.pos.y !== this.tile.position.y) {
      this.tile = this.room.terrain.getTileAt(this.creep.pos.x, this.creep.pos.y);
      this.tile.creep = this;
    }

    if(!this.lastPosition)
      this.lastPosition = this.creep.pos;

    if(!this.strategy)
      return;

    this.say(this.strategy.name, true);

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
