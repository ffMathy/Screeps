import CreepDecorator from 'CreepDecorator';
import Arrays from 'helpers/Arrays';
import RoomDecorator from 'RoomDecorator';
import RoomsDecorator from 'RoomsDecorator';
import { CreepStrategy } from 'strategies/Strategy';
import HarvestCreepStrategy from 'strategies/creep/HarvestCreepStrategy';
import UpgradeCreepStrategy from 'strategies/creep/UpgradeCreepStrategy';
import TransferCreepStrategy from 'strategies/creep/TransferCreepStrategy';
import BuildingCreepStrategy from 'strategies/creep/BuildingCreepStrategy';
import WalkToCreepStrategy from 'strategies/creep/WalkToCreepStrategy';
import profile from 'profiler';

@profile
export default class RoomCreepsDecorator {
  public all: CreepDecorator[];
  public active: CreepDecorator[];
  public idle: CreepDecorator[];

  private _strategyOffset: number;

  public get isPopulationMaintained() {
    return this.all.length >= 25;
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

    creep.setStrategy(null);
  }

  add(creep: CreepDecorator) {
    if (Arrays.add(this.all, creep)) {
      creep.setStrategy(
        new WalkToCreepStrategy(
          creep,
          creep.room.room.getPositionAt(25, 25),
          null));

      Arrays.add(this.active, creep);

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

  private reserveSpot(creep: CreepDecorator, position: RoomPosition, radius: number) {
    let sourceTile = creep.room.terrain.getTileAt(position);

    let parkingLot = sourceTile.getSurroundingEnvironment(radius);
    if(parkingLot.availableTiles.length === 0)
      return null;

    return parkingLot.availableTiles[0];
  }

  private walkToIfPossible(
    creep: CreepDecorator,
    position: RoomPosition,
    radius: number,
    successorStrategy: CreepStrategy)
  {
    let reservation = this.reserveSpot(creep, position, radius);
    if(!reservation)
      return null;

    return new WalkToCreepStrategy(
      creep,
      reservation.tile.position,
      successorStrategy);
  }

  private getNeededStrategy(creep: CreepDecorator): CreepStrategy {
    let energyCarry = creep.creep.carry.energy;

    let possibilities = new Array<CreepStrategy>();

    let isEmpty = energyCarry === 0;
    if(isEmpty) {
      for(let source of this.room.sources) {
        Arrays.add(
          possibilities,
          this.walkToIfPossible(
            creep,
            source.pos,
            1,
            new HarvestCreepStrategy(
              creep,
              source.id)
          ));
      }
    }

    if (!isEmpty) {
      let availableTransferSites = creep.room.getTransferrableStructures();
      for(let availableTransferSite of availableTransferSites) {
        Arrays.add(
          possibilities,
          this.walkToIfPossible(
            creep,
            availableTransferSite.pos,
            1,
            new TransferCreepStrategy(
              creep,
              availableTransferSite.id)
          ));
      }

      if (creep.room.room && creep.room.room.controller) {
        Arrays.add(
          possibilities,
          this.walkToIfPossible(
            creep,
            creep.room.room.controller.pos,
            3,
            new UpgradeCreepStrategy(creep)
          ));
      }

      let availableConstructionSites = creep.room.constructionSites;
      if (availableConstructionSites) {
        for(let availableConstructionSite of availableConstructionSites) {
          Arrays.add(
            possibilities,
            this.walkToIfPossible(
              creep,
              availableConstructionSite.pos,
              availableConstructionSite.structureType === STRUCTURE_ROAD ? 1 : 3,
              new BuildingCreepStrategy(
                creep,
                availableConstructionSite.id)
            ));
        }
      }
    }

    if(possibilities.length === 0) {
      Arrays.add(
        possibilities,
        this.walkToIfPossible(
          creep,
          this.room.room.getPositionAt(25, 25),
          3,
          null
        ));
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
      if(neededStrategy) {
        Arrays.add(this.active, nextIdleCreep);
        Arrays.remove(this.idle, nextIdleCreep);

        nextIdleCreep.setStrategy(neededStrategy);
      }
    }

    for (let creep of this.active) {
      creep.tick();
    }
  }
}
