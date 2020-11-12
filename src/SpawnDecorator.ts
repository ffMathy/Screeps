import CreepDecorator from 'CreepDecorator';
import GameDecorator from 'GameDecorator';
import RoomDecorator from 'RoomDecorator';
import profile from 'profiler';
import SurroundingTileEnvironment from 'terrain/SurroundingTileEnvironment';
import Arrays from 'helpers/Arrays';

@profile
export default class SpawnDecorator {
    private readonly spawnName: string;

    private readonly spawnQueue: CreepDecorator[];

    transferEnvironment: SurroundingTileEnvironment;

    readonly id: string;

    get energyCapacity() {
        return this.spawn.energyCapacity;
    }

    get energy() {
        return this.spawn.energy;
    }

    get needsEnergy() {
        return this.energy < this.energyCapacity && this.transferEnvironment.occupiedTiles.length < 3;
    }

    constructor(
        private readonly game: GameDecorator,
        public readonly room: RoomDecorator,
        public readonly spawn: StructureSpawn)
    {
        this.spawnQueue = [];

        if(this.spawn === null) {
            this.id = null;

            for(let key in Game.spawns) {
                this.spawnName = key;
                break;
            }
        } else {
            this.id = this.spawn.id;
            this.spawnName = this.spawn.name;
        }
    }

    initialize() {
        let tile = this.room.terrain.getTileAt(this.spawn.pos);
        this.transferEnvironment = tile.getSurroundingEnvironment(1, 1);
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
            if(!creepSpawned)
                throw new Error('Could not fetch spawned creep.');

            let creepDecorator = new CreepDecorator(this.game, creepSpawned);
            Arrays.add(this.spawnQueue, creepDecorator);

            this.room.sayAt(Game.spawns[this.spawnName], '🛠️');
        } else if(spawnResult === ERR_NOT_ENOUGH_ENERGY) {
            this.room.sayAt(Game.spawns[this.spawnName], '⚡');
        } else if(spawnResult === ERR_NAME_EXISTS) {
            return;
        } else {
            throw new Error('Could not spawn creep: ' + spawnResult);
        }
    }

    maintainPopulation() {
        if(this.getSpawnDetails())
            return;

        if(!this.room.creeps.isPopulationMaintained) {
            this.spawnCreep([MOVE, MOVE, CARRY, CARRY, WORK], this.room.roomName);
        }
        //  else if(this.room.creeps.isPopulationMaintained && this.room.unexploredNeighbourNames.length > 0) {
        //     this.spawnCreep([CLAIM, MOVE], this.room.getRandomUnexploredNeighbourName());
        // }
    }

    tick() {
        if(!this.getSpawnDetails()) {
            while(this.spawnQueue.length > 0) {
                let creepDecorator = this.spawnQueue.splice(0, 1)[0];
                this.room.creeps.add(creepDecorator);

                creepDecorator.tick();
            }
        }

        this.maintainPopulation();
    }
};
