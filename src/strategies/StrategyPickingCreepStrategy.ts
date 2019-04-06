import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import BuildingCreepStrategy from "./BuildingCreepStrategy";
import ParkingCreepStrategy from "./ParkingCreepStrategy";
import HarvestCreepStrategy from "./HarvestCreepStrategy";

export default class StrategyPickingCreepStrategy implements CreepStrategy {
  tick(creep: CreepDecorator) {
    let energyCarry = creep.creep.carry.energy;
    let carryCapacity = creep.creep.carryCapacity;

    let isFull = energyCarry === carryCapacity;
    if(!isFull)
      return creep.setStrategy(new HarvestCreepStrategy());

    let availableConstructionSites = creep.room.getConstructionSites();
    if(availableConstructionSites.length > 0)
      return creep.setStrategy(new BuildingCreepStrategy());

    return creep.setStrategy(new ParkingCreepStrategy());
  }
}
