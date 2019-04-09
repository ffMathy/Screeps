import CreepDecorator, { CreepStrategy } from "CreepDecorator";
import BuildingCreepStrategy from "./BuildingCreepStrategy";
import HarvestCreepStrategy from "./HarvestCreepStrategy";
import TransferCreepStrategy from "./TransferCreepStrategy";
import UpgradeCreepStrategy from "./UpgradeCreepStrategy";
import ParkingCreepStrategy from "./ParkingCreepStrategy";
import GameDecorator from "GameDecorator";

export default class StrategyPickingCreepStrategy implements CreepStrategy {
  get name() {
    return "look";
  }

  tick(creep: CreepDecorator) {
    let energyCarry = creep.creep.carry.energy;
    let carryCapacity = creep.creep.carryCapacity;

    let isFull = energyCarry === carryCapacity;
    let isEmpty = energyCarry == 0;
    let availableSources = creep.room.sources.filter(x => !GameDecorator.instance.resources.isReserved(x.id));
    if(!isFull && availableSources.length > 0)
      return creep.setStrategy(new HarvestCreepStrategy());

    if(!isEmpty) {
      if(creep.room.room.controller.ticksToDowngrade < 1000)
        return creep.setStrategy(new UpgradeCreepStrategy());

      let availableConstructionSites = creep.room.constructionSites;
      if(availableConstructionSites.length > 0)
        return creep.setStrategy(new BuildingCreepStrategy());

      let availableTransferSites = creep.room.getTransferrableStructures();
      if(availableTransferSites.length > 0)
        return creep.setStrategy(new TransferCreepStrategy());

      return creep.setStrategy(new UpgradeCreepStrategy());
    }

    return creep.setStrategy(new ParkingCreepStrategy());
  }
}
