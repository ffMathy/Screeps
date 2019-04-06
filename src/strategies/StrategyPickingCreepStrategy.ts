import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import BuildingCreepStrategy from "./BuildingCreepStrategy";
import HarvestCreepStrategy from "./HarvestCreepStrategy";
import TransferCreepStrategy from "./TransferCreepStrategy";
import UpgradeCreepStrategy from "./UpgradeCreepStrategy";

export default class StrategyPickingCreepStrategy implements CreepStrategy {
  get name() {
    return "look";
  }

  tick(creep: CreepDecorator) {
    let energyCarry = creep.creep.carry.energy;
    let carryCapacity = creep.creep.carryCapacity;

    let isFull = energyCarry === carryCapacity;
    if(!isFull)
      return creep.setStrategy(new HarvestCreepStrategy());

    let availableConstructionSites = creep.room.getConstructionSites();
    if(availableConstructionSites.length > 0)
      return creep.setStrategy(new BuildingCreepStrategy());

    let availableTransferSites = creep.room.getTransferrableStructures();
    if(availableTransferSites.length > 0)
      return creep.setStrategy(new TransferCreepStrategy());

    return creep.setStrategy(new UpgradeCreepStrategy());
  }
}
