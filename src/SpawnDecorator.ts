import CreepDecorator from 'CreepDecorator';
import GameDecorator from 'GameDecorator';
import RoomDecorator from 'RoomDecorator';
import ParkingCreepStrategy from 'strategies/creep/ParkingCreepStrategy';

export default class SpawnDecorator {
    private readonly spawnName: string;

    private static nameOffset = 0;

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

    spawnCreep(qualities, roomName: string) {
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
                creepDecorator.setStrategy(new ParkingCreepStrategy(creepDecorator, roomName));

                this.game.creeps.add(creepDecorator);

                this.room.sayAt(Game.spawns[this.spawnName], '🛠️');
            } else if(spawnResult === ERR_NOT_ENOUGH_ENERGY) {
                this.room.sayAt(Game.spawns[this.spawnName], '🙁 energy');
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

        if(this.room.isPopulationMaintained && this.room.unexploredNeighbourNames.length > 0) {
            this.spawnCreep([CLAIM, MOVE], this.room.getRandomUnexploredNeighbourName());
        } else if(this.game.rooms.lowPopulation.length > 0) {
            for(let room of this.game.rooms.lowPopulation) {
                this.spawnCreep([MOVE, MOVE, CARRY, WORK], room.roomName);
            }
        }
    }

    tick() {
        this.maintainPopulation();
    }
};
