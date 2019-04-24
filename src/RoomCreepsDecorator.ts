import CreepDecorator from 'CreepDecorator';
import Arrays from 'helpers/Arrays';
import RoomDecorator from 'RoomDecorator';
import RoomsDecorator from 'RoomsDecorator';
import { CreepStrategy } from 'strategies/Strategy';
import GameDecorator from 'GameDecorator';
import HarvestCreepStrategy from 'strategies/creep/HarvestCreepStrategy';
import UpgradeCreepStrategy from 'strategies/creep/UpgradeCreepStrategy';
import TransferCreepStrategy from 'strategies/creep/TransferCreepStrategy';
import BuildingCreepStrategy from 'strategies/creep/BuildingCreepStrategy';
import profile from 'profiler';

@profile
export default class RoomCreepsDecorator {
  public all: CreepDecorator[];
  public active: CreepDecorator[];
  public idle: CreepDecorator[];

  private _strategyOffset: number;

  public get isPopulationMaintained() {
    return this.idle.length > this.active.length / 3;
  }

  constructor(
    private readonly rooms: RoomsDecorator,
    private readonly room: RoomDecorator) {
    this.all = [];
    this.active = [];
    this.idle = [];

    this._strategyOffset = 0;
  }

  initialize(allCreeps: CreepDecorator[]) {
    for (let creep of allCreeps)
      this.add(creep);
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
      this.setIdle(creep);
      this.refreshPopulationMaintenanceStatus();
    }
  }

  private refreshPopulationMaintenanceStatus() {
    if (this.isPopulationMaintained || !this.room.room || !this.room.room.controller) {
      Arrays.remove(this.rooms.lowPopulation, this.room);

      if (this.room.room)
        this.room.sayAt(this.room.room.controller, '😃');
    } else {
      Arrays.add(this.rooms.lowPopulation, this.room);

      if (this.room.room)
        this.room.sayAt(this.room.room.controller, '😟');
    }
  }

  private getNeededStrategy(creep: CreepDecorator): CreepStrategy {
    let energyCarry = creep.creep.carry.energy;

    let possibilities = new Array<CreepStrategy>();

    let isEmpty = energyCarry == 0;
    let availableSources = creep.room.sources.filter(x => !GameDecorator.instance.resources.isReserved(x.id));
    if (isEmpty && availableSources.length > 0)
      possibilities.push(new HarvestCreepStrategy(creep));

    if (!isEmpty) {
      if (creep.room.room && (creep.room.room.controller.level === 0 || (creep.room.room.controller.ticksToDowngrade > 0 && creep.room.room.controller.ticksToDowngrade < 5000))) {
        possibilities.push(new UpgradeCreepStrategy(creep));
      }

      let availableTransferSites = creep.room.getTransferrableStructures();
      if (availableTransferSites.length > 0)
        possibilities.push(new TransferCreepStrategy(creep, availableTransferSites));

      let availableConstructionSites = creep.room.constructionSites;
      if (availableConstructionSites.length > 0)
        possibilities.push(new BuildingCreepStrategy(creep));

      possibilities.push(new UpgradeCreepStrategy(creep));
    }

    let offset = this._strategyOffset++ % possibilities.length;
    return possibilities[offset];
  }

  tick() {
    if (this.idle.length > 0) {
      let offset = this._strategyOffset % this.idle.length;
      let nextIdleCreep = this.idle[offset];

      let neededStrategy = this.getNeededStrategy(nextIdleCreep);
      if(!!neededStrategy) {
        Arrays.add(this.active, nextIdleCreep);
        Arrays.remove(this.idle, nextIdleCreep);
        nextIdleCreep.setStrategy(neededStrategy);
      } else {
        // let spiralOffset = Coordinates.calculateSpiralOffset((offset + 1) * 2);
        // nextIdleCreep.moveTo(new RoomPosition(25 + spiralOffset.x, 25 + spiralOffset.y, this.room.roomName));
      }
    }

    for (let creep of this.active) {
      creep.tick();
    }
  }
}
