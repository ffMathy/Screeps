import CreepDecorator from 'CreepDecorator';
import GameDecorator from 'GameDecorator';
import RoomDecorator from 'RoomDecorator';
import ParkingCreepStrategy from 'strategies/ParkingCreepStrategy';

export default class SpawnDecorator {
    private _isPopulationMaintained: boolean;

    public get isPopulationMaintained() {
        return this._isPopulationMaintained;
    }

    constructor(
        private readonly game: GameDecorator,
        public readonly room: RoomDecorator,
        private readonly spawn: Spawn)
    {
        this._isPopulationMaintained = false;
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

        let spawnName;
        if(this.spawn === null) {
            for(let key in Game.spawns) {
                spawnName = key;
                break;
            }
        } else {
            spawnName = this.spawn.name;
        }

        let creepName = 'creep-' + Game.time;
        let spawnResult = Game.spawns[spawnName].spawnCreep(
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
            if(this.spawn === null)
                creepDecorator.setStrategy(new ParkingCreepStrategy(this.room.room.name));

            this.game.creeps.all.push(creepDecorator);

            creepDecorator.room.sayAt(Game.spawns[spawnName], '🛠️');
        }
    }

    maintainPopulation(qualities, count) {
        if(this.getSpawnDetails())
            return;

        this._isPopulationMaintained = this.game.creeps.all.length >= count;
        if(this._isPopulationMaintained && this.room.unexploredNeighbourNames.length > 0) {
            this.spawnCreep([CLAIM, MOVE]);
        } else if(!this._isPopulationMaintained) {
            this.spawnCreep(qualities);
        }
    }

    tick() {
        this.maintainPopulation([MOVE, CARRY, WORK], 15);
    }
};
