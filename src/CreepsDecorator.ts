import CreepDecorator from 'CreepDecorator';
import Arrays from 'helpers/Arrays';
import RoomDecorator from 'RoomDecorator';
import RoomsDecorator from 'RoomsDecorator';
import { CreepStrategy } from 'strategies/Strategy';
import HarvestCreepStrategy from 'strategies/creep/HarvestCreepStrategy';
import UpgradeCreepStrategy from 'strategies/creep/UpgradeCreepStrategy';
import TransferCreepStrategy from 'strategies/creep/TransferCreepStrategy';
import WalkToCreepStrategy from 'strategies/creep/WalkToCreepStrategy';
import profile from 'profiler';
import SurroundingTileEnvironment from 'terrain/SurroundingTileEnvironment';

@profile
export default class CreepsDecorator {
  public all: CreepDecorator[];
  public active: CreepDecorator[];
  public idle: CreepDecorator[];

  private _strategyOffset: number;

  enableStrategyDebugging = false;

  public get isPopulationMaintained() {
    return this.idle.length > 1;
  }

  constructor(
    private readonly rooms: RoomsDecorator,
    private readonly room: RoomDecorator) {
    this.all = [];
    this.active = [];
    this.idle = [];

    this._strategyOffset = 0;
  }

  initialize() {
    Arrays.add(this.room.visuals, (visual: RoomVisual) => visual
      .text(
        this.isPopulationMaintained ? '' : '🔺',
        this.room.room.controller.pos.x,
        this.room.room.controller.pos.y + 1
      )
      .text(
        '💤' + this.idle.length + ' 👷' + this.active.length,
        this.room.room.controller.pos.x,
        this.room.room.controller.pos.y + 2));
  }

  remove(creep: CreepDecorator) {
    if (Arrays.remove(this.all, creep)) {
      Arrays.remove(this.idle, creep);
      Arrays.remove(this.active, creep);

      this.refreshPopulationMaintenanceStatus();
    }
  }

  setIdle(creep: CreepDecorator) {
    Arrays.remove(this.active, creep);
    if (!Arrays.add(this.idle, creep))
      return;

    creep.say('💤', true);
  }

  add(creep: CreepDecorator) {
    if (Arrays.add(this.all, creep)) {
      Arrays.add(this.idle, creep);
      this.refreshPopulationMaintenanceStatus();
    }
  }

  private refreshPopulationMaintenanceStatus() {
    if (this.isPopulationMaintained || !this.room.room || !this.room.room.controller) {
      Arrays.remove(this.rooms.lowPopulation, this.room);
    } else {
      Arrays.add(this.rooms.lowPopulation, this.room);
    }
  }

  private walkToIfPossible(
    creep: CreepDecorator,
    reservation: SurroundingTileEnvironment,
    successorStrategy: CreepStrategy)
  {
    if(!reservation.entrypoint)
      throw new Error('Entrypoint for reservation is not present.');

    let tilesToAvoid = reservation.minimumRadius > 1 ? [] : reservation.tilesGroupedByProximity[reservation.minimumRadius];
    let availableTile = reservation.availableTiles[0];
    if(!availableTile)
      return null;

    let viaPosition = reservation.entrypoint.position;
    let position = reservation.center.position;
    if(viaPosition.x === position.x && viaPosition.y === position.y)
      viaPosition = null;

    Arrays.remove(tilesToAvoid, availableTile);

    return new WalkToCreepStrategy(
      creep,
      viaPosition,
      availableTile.tile.position,
      tilesToAvoid.map(t => t.tile.position),
      successorStrategy);
  }

  private getNeededHarvestStrategies(creep: CreepDecorator) {
    return this.room
      .sources
      .map(source => this.walkToIfPossible(
        creep,
        source.harvestEnvironment,
        new HarvestCreepStrategy(
          creep,
          source.source.id)
      ));
  }

  private getNeededTransferStrategies(creep: CreepDecorator) {
    return this.room.spawns
      .map(availableTransferSite => this.walkToIfPossible(
        creep,
        availableTransferSite.transferEnvironment,
        new TransferCreepStrategy(
          creep,
          availableTransferSite.id)
      ));
  }

  // private getNeededBuildStrategies(creep: CreepDecorator) {
  //   return this.room
  //     .constructionSites
  //     .map(availableConstructionSite => this.walkToIfPossible(
  //       creep,
  //       availableConstructionSite.pos,
  //       availableConstructionSite.structureType === STRUCTURE_ROAD ? 1 : 3,
  //       1,
  //       new BuildingCreepStrategy(
  //         creep,
  //         availableConstructionSite.id)
  //     ));
  // }

  private getNeededUpgradeStrategy(creep: CreepDecorator) {
    return this.walkToIfPossible(
      creep,
      creep.room.controller.upgradeEnvironment,
      new UpgradeCreepStrategy(creep)
    );
  }

  private getNeededStrategy(creep: CreepDecorator): CreepStrategy {
    let energyCarry = creep.creep.carry.energy;

    let possibilities = new Array<CreepStrategy>();

    let isEmpty = energyCarry === 0;
    if (isEmpty)
      possibilities.push(...this.getNeededHarvestStrategies(creep))

    if (!isEmpty) {
      possibilities.push(...this.getNeededTransferStrategies(creep));

      if (creep.room.room && creep.room.room.controller)
        possibilities.push(this.getNeededUpgradeStrategy(creep));

      // possibilities.push(...this.getNeededBuildStrategies(creep));
    }

    let offset = this._strategyOffset++ % possibilities.length;
    return possibilities[offset];
  }

  tick() {
    //it is very important only to take 1 idle creep - or else a race condition can occur where two creeps can go to the same reserved spot.
    if (this.idle.length > 0) {
      let offset = this._strategyOffset % this.idle.length;
      let nextIdleCreep = this.idle[offset];

      let neededStrategy = this.getNeededStrategy(nextIdleCreep);
      if (neededStrategy) {
        Arrays.add(this.active, nextIdleCreep);
        Arrays.remove(this.idle, nextIdleCreep);

        nextIdleCreep.strategy = neededStrategy;
      } else if(!nextIdleCreep.strategy) {
        // let minimumRadius = 3;
        // let maximumRadius = 4;

        // let targetX = 25;
        // let targetY = 25;

        // if(Math.abs(nextIdleCreep.creep.pos.x - targetX) > maximumRadius && Math.abs(nextIdleCreep.creep.pos.y - targetY) > maximumRadius) {
        //   nextIdleCreep.strategy = this.walkToIfPossible(
        //     nextIdleCreep,
        //     this.room.room.getPositionAt(25, 25),
        //     maximumRadius,
        //     minimumRadius,
        //     null);
        // }
      }
    }

    for (let creep of this.active) {
      creep.tick();
    }

    for(let creep of this.idle) {
      creep.tick();
    }
  }
}
