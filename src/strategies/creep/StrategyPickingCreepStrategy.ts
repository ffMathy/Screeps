import CreepDecorator from "CreepDecorator";
import BuildingCreepStrategy from "./BuildingCreepStrategy";
import HarvestCreepStrategy from "./HarvestCreepStrategy";
import TransferCreepStrategy from "./TransferCreepStrategy";
import UpgradeCreepStrategy from "./UpgradeCreepStrategy";
import ParkingCreepStrategy from "./ParkingCreepStrategy";
import GameDecorator from "GameDecorator";
import ExploreCreepStrategy from "./ExploreCreepStrategy";
import Strategy from "strategies/Strategy";

export default class StrategyPickingCreepStrategy implements Strategy {
  get name() {
    return "look";
  }

  constructor(
    private readonly creep: CreepDecorator)
  { }

  tick() {
    let creep = this.creep;
    let energyCarry = creep.creep.carry.energy;
    let carryCapacity = creep.creep.carryCapacity;

    if(creep.room.unexploredNeighbourNames.length > 0 && creep.creep.body.find(x => x.type === CLAIM))
      return creep.setStrategy(new ExploreCreepStrategy(creep.room.getRandomUnexploredNeighbourName()));

    let isFull = energyCarry === carryCapacity;
    let isEmpty = energyCarry == 0;
    let availableSources = creep.room.sources.filter(x => !GameDecorator.instance.resources.isReserved(x.id));
    if(!isFull && availableSources.length > 0)
      return creep.setStrategy(new HarvestCreepStrategy(creep));

    if(!isEmpty) {
      if(creep.room.room && (creep.room.room.controller.level === 0 || (creep.room.room.controller.ticksToDowngrade > 0 && creep.room.room.controller.ticksToDowngrade < 5000))) {
        return creep.setStrategy(new UpgradeCreepStrategy(creep));
      }

      if(!creep.room.spawns.find(x => !!x.getSpawnDetails())) {
        let availableTransferSites = creep.room.getTransferrableStructures();
        if(availableTransferSites.length > 0)
          return creep.setStrategy(new TransferCreepStrategy(availableTransferSites));
      }

      let availableConstructionSites = creep.room.constructionSites;
      if(availableConstructionSites.length > 0)
        return creep.setStrategy(new BuildingCreepStrategy(creep));

      return creep.setStrategy(new UpgradeCreepStrategy(creep));
    }

    return creep.setStrategy(new ParkingCreepStrategy(creep));
  }
}
