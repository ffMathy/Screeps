import CreepDecorator from 'CreepDecorator';

export default {

    run: function(creepDecorator: CreepDecorator) {
        var creep = creepDecorator.creep;
        if(creep.carry.energy < creep.carryCapacity) {
            creepDecorator.harvestSource();
        }
        else {
            creepDecorator.transferEnergy();
        }
    }
};
