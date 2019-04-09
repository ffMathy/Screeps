import creeps from 'creeps';
import CreepDecorator from 'CreepDecorator';

class Spawns {
    private readonly spawnName = 'Spawn1';

    constructor() {
    }

    getTimeUntilSpawn() {
        var spawnDetails = this.getSpawnDetails();
        if(!spawnDetails)
            return null;

        return spawnDetails.remainingTime;
    }

    getSpawningCreep() {
        var spawnDetails = this.getSpawnDetails();
        if(!spawnDetails)
            return null;

        return Game.creeps[spawnDetails.name];
    }

    getSpawnDetails() {
        return Game.spawns[this.spawnName].spawning;
    }

    spawnCreep(qualities) {
        if(this.getSpawnDetails())
            return;

        let creepName = 'creep-' + Game.time;
        let spawnResult = Game.spawns[this.spawnName].spawnCreep(
            qualities,
            creepName,
            {
                memory: {
                }
            });

        if(spawnResult === 0) {
            let creepSpawned = Game.creeps[creepName];
            if(!creepSpawned) {
                console.log('could not fetch spawned creep');
                return;
            }

            let creepDecorator = new CreepDecorator(creepSpawned);
            creeps.all.push(creepDecorator);

            creepDecorator.room.sayAt(Game.spawns[this.spawnName], '🛠️');
        }
    }

    maintainPopulation(qualities, count) {
        if(this.getSpawnDetails())
            return;

        if(creeps.all.length < count)
            this.spawnCreep(qualities);
    }

    tick() {
        this.maintainPopulation([MOVE, MOVE, CARRY, WORK], 15);
    }
};

export default new Spawns();
