import CreepDecorator from 'CreepDecorator';
import Arrays from 'helpers/Arrays';
import RoomDecorator from 'RoomDecorator';
import RoomsDecorator from 'RoomsDecorator';
import ParkingCreepStrategy from 'strategies/creep/ParkingCreepStrategy';
import { CreepStrategy } from 'strategies/Strategy';

export default class RoomCreepsDecorator {
  public all: CreepDecorator[];
  public active: CreepDecorator[];
  public idle: CreepDecorator[];

  public neededStrategies: (() => CreepStrategy)[];

  public get isPopulationMaintained() {
    return this.active.length > this.idle.length * 3;
  }

  constructor(
    private readonly rooms: RoomsDecorator,
    private readonly room: RoomDecorator)
  {
    this.all = [];
    this.active = [];
    this.idle = [];
    this.neededStrategies = [];
  }

  initialize(allCreeps: CreepDecorator[]) {
    for (let creep of allCreeps)
      this.add(creep);
  }

  queueStrategy<T extends CreepStrategy>(type: {new(...args): T, name: string}, max: number, strategyFactory: () => T) {
    this.neededStrategies.push(strategyFactory);
  }

  remove(creep: CreepDecorator) {
    if(Arrays.remove(this.all, creep)) {
      Arrays.remove(this.idle, creep);
      Arrays.remove(this.active, creep);

      this.refreshPopulationMaintenanceStatus();
    }
  }

  setIdle(creep: CreepDecorator) {
    if(!Arrays.add(this.idle, creep))
      return;

    creep.setStrategy(new ParkingCreepStrategy(creep));
  }

  add(creep: CreepDecorator) {
    if(Arrays.add(this.all, creep)) {
      Arrays.add(this.idle, creep);
      this.refreshPopulationMaintenanceStatus();
    }
  }

  private refreshPopulationMaintenanceStatus() {
    if(this.isPopulationMaintained || !this.room.room || !this.room.room.controller) {
      Arrays.remove(this.rooms.lowPopulation, this.room);

      if(this.room.room)
        this.room.sayAt(this.room.room.controller, '😃');
    } else {
      Arrays.add(this.rooms.lowPopulation, this.room);

      if(this.room.room)
        this.room.sayAt(this.room.room.controller, '😟');
    }
  }

  tick() {
    while(this.idle.length > 0 && this.neededStrategies.length > 0) {
      let nextIdleCreep = this.idle.splice(0, 1)[0];
      nextIdleCreep.setStrategy(this.neededStrategies.splice(0, 1)[0]());
      Arrays.add(this.active, nextIdleCreep);
    }

    for (let creep of this.active) {
      creep.tick();
    }
  }
}
