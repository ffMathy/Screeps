import CreepDecorator from 'CreepDecorator';
import GameDecorator from 'GameDecorator';
import RoomDecorator from 'RoomDecorator';

export default class SpawnDecorator {
    private readonly spawnName: string;

    constructor(
        private readonly game: GameDecorator,
        public readonly room: RoomDecorator,
        private readonly spawn: Spawn)
    {
        if(this.spawn === null) {
            for(let key in Game.spawns) {
                this.spawnName = key;
                break;
            }
        } else {
            this.spawnName = this.spawn.name;
        }
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
        if(!this.spawn)
            return null;

        return Game.spawns[this.spawn.name].spawning;
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

            let creepDecorator = new CreepDecorator(this.game, creepSpawned);
            this.game.creeps.add(creepDecorator);

            this.room.sayAt(Game.spawns[this.spawnName], '🛠️');
        }
    }

    maintainPopulation(qualities) {
        if(this.getSpawnDetails())
            return;

        if(this.room.isPopulationMaintained && this.room.unexploredNeighbourNames.length > 0) {
            this.spawnCreep([CLAIM, MOVE]);
        } else if(!this.room.isPopulationMaintained) {
            this.spawnCreep(qualities);
        }
    }

    tick() {
        this.maintainPopulation([MOVE, CARRY, WORK]);
    }
};
