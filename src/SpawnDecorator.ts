import CreepDecorator from 'CreepDecorator';
import GameDecorator from 'GameDecorator';
import RoomDecorator from 'RoomDecorator';
import profile from 'profiler';

@profile
export default class SpawnDecorator {
    private readonly spawnName: string;

    private static nameOffset = 0;

    constructor(
        private readonly game: GameDecorator,
        public readonly room: RoomDecorator,
        public readonly spawn: Spawn)
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

    spawnCreep(qualities, _roomName: string) {
        if(this.getSpawnDetails())
            return;

        let nameExistsAlready = false;
        do {
            let creepName = 'creep-' + (Game.time + SpawnDecorator.nameOffset++);
            let spawnResult = Game.spawns[this.spawnName].spawnCreep(
                qualities,
                creepName,
                {
                    memory: {
                    }
                });

            if(spawnResult === 0) {
                let creepSpawned = Game.creeps[creepName];
                if(!creepSpawned)
                    throw new Error('Could not fetch spawned creep.');

                let creepDecorator = new CreepDecorator(this.game, creepSpawned);
                this.room.creeps.add(creepDecorator);
                this.room.sayAt(Game.spawns[this.spawnName], '🛠️');
            } else if(spawnResult === ERR_NOT_ENOUGH_ENERGY) {
                this.room.sayAt(Game.spawns[this.spawnName], '⚡');
            } else if(spawnResult === ERR_NAME_EXISTS) {
                nameExistsAlready = true;
            } else {
                throw new Error('Could not spawn creep: ' + spawnResult);
            }
        } while(nameExistsAlready);
    }

    maintainPopulation() {
        if(this.getSpawnDetails())
            return;

        if(!this.room.creeps.isPopulationMaintained) {
            this.spawnCreep([MOVE, MOVE, CARRY, WORK], this.room.roomName);
        }
        //  else if(this.room.creeps.isPopulationMaintained && this.room.unexploredNeighbourNames.length > 0) {
        //     this.spawnCreep([CLAIM, MOVE], this.room.getRandomUnexploredNeighbourName());
        // }
    }

    tick() {
        this.maintainPopulation();
    }
};
