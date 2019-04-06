import CreepDecorator from 'CreepDecorator';

export default {

  run: function(creepDecorator: CreepDecorator) {
      var creep = creepDecorator.creep;
        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
        }
        if(!creep.memory.upgrading && creep.carry.energy >= creep.carryCapacity) {
            creep.memory.upgrading = true;
            creep.moveTo(Game.spawns['Spawn1'], {visualizePathStyle: {stroke: '#FF0000'}})
        }

        if(creep.memory.upgrading) {
            creepDecorator.upgradeController();
        }
        else {
            creepDecorator.harvestSource();
        }
    }
};
