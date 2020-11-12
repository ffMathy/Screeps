import CreepDecorator from 'CreepDecorator';
import Arrays from 'helpers/Arrays';
import RoomDecorator from 'RoomDecorator';
import RoomsDecorator from 'RoomsDecorator';
import { CreepStrategy } from 'strategies/Strategy';
import HarvestCreepStrategy from 'strategies/creep/HarvestCreepStrategy';
import UpgradeCreepStrategy from 'strategies/creep/UpgradeCreepStrategy';
import TransferCreepStrategy from 'strategies/creep/TransferCreepStrategy';
import WalkToCreepStrategy from 'strategies/creep/WalkToCreepStrategy';

import SurroundingTileEnvironment from 'terrain/SurroundingTileEnvironment';
import BuildingCreepStrategy from 'strategies/creep/BuildingCreepStrategy';


export default class CreepsDecorator {
  public all: CreepDecorator[];
  public active: CreepDecorator[];
  public idle: CreepDecorator[];

  private _strategyOffset: number;

  enableStrategyDebugging = false;

  public get isPopulationMaintained() {
    return this.idle.length >= 5;
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
    console.log('creeps-init');

    if(this.room.controller.controller && this.room.controller.controller.my) {
      Arrays.add(this.room.visuals, (visual: RoomVisual) => visual
        .text(
          this.isPopulationMaintained ? '' : '🔺',
          this.room.room.controller.pos.x,
          this.room.room.controller.pos.y - 2
        )
        .text(
          '💤' + this.idle.length + ' 👷' + this.active.length,
          this.room.room.controller.pos.x,
          this.room.room.controller.pos.y - 1));
    }
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
    if(!reservation) {
      console.log(creep.creep.name);
      throw new Error('No environment found.');
    }

    try {
      let availableTile = reservation.availableTiles[0];
      if(!availableTile)
        return null;

      let viaPosition = null;

      return new WalkToCreepStrategy(
        creep,
        viaPosition,
        availableTile.tile.position,
        successorStrategy);
    } catch(ex) {
      console.log(creep.creep.name, reservation.center.position);
      throw ex;
    }
  }

  private getNeededHarvestStrategies(creep: CreepDecorator) {
    return this.room
      .sources
      .map(source => {
        return this.walkToIfPossible(
          creep,
          source.harvestEnvironment,
          new HarvestCreepStrategy(
            creep,
            source.source.id));
      })
      .filter(x => !!x);
  }

  private getNeededTransferStrategies(creep: CreepDecorator) {
    return [...this.room.spawns, ...this.room.extensions]
      .filter(x => x.energy < x.energyCapacity)
      .map(availableTransferSite => {
        return this.walkToIfPossible(
          creep,
          availableTransferSite.transferEnvironment,
          new TransferCreepStrategy(
            creep,
            availableTransferSite.id));
      })
      .filter(x => !!x);
  }

  private getNeededBuildStrategies(creep: CreepDecorator) {
    return this.room
      .constructionSites
      .map(availableConstructionSite => {
        let amount = availableConstructionSite.structureType === STRUCTURE_ROAD ? 1 : 1;
        return this.walkToIfPossible(
          creep,
          this.room.terrain.getTileAt(availableConstructionSite.pos).getSurroundingEnvironment(3, 1, amount, true),
          new BuildingCreepStrategy(
            creep,
            availableConstructionSite.id));
      })
      .filter(x => !!x);
  }

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

      if(this.idle.length > 1)
        possibilities.push(...this.getNeededBuildStrategies(creep));

      if (this.idle.length > 2 && creep.room.room && creep.room.room.controller)
        Arrays.add(possibilities, this.getNeededUpgradeStrategy(creep));
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
        let minimumRadius = 1;
        let maximumRadius = 5;

        let targetX = 24;
        let targetY = 24;

        let isOutside = Math.abs(nextIdleCreep.creep.pos.x - targetX) > 0 && Math.abs(nextIdleCreep.creep.pos.y - targetY) > 0;
        if(isOutside) {
          nextIdleCreep.strategy = this.walkToIfPossible(
            nextIdleCreep,
            this.room.terrain.getTileAt(targetX, targetY).getSurroundingEnvironment(maximumRadius, minimumRadius, -1, true),
            null);
        }
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
