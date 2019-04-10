import CreepDecorator from 'CreepDecorator';
import GameDecorator from 'GameDecorator';
import RoomDecorator from 'RoomDecorator';

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
        return Game.spawns[this.spawn.name].spawning;
    }

    spawnCreep(qualities) {
        if(this.getSpawnDetails())
            return;

        let creepName = 'creep-' + Game.time;
        let spawnResult = Game.spawns[this.spawn.name].spawnCreep(
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
            this.game.creeps.all.push(creepDecorator);

            creepDecorator.room.sayAt(Game.spawns[this.spawn.name], '🛠️');
        }
    }

    maintainPopulation(qualities, count) {
        if(this.getSpawnDetails())
            return;

        if(this._isPopulationMaintained && this.room.unexploredNeighbourNames.length > 0) {
            this.spawnCreep([CLAIM, MOVE]);
        } else if(this.game.creeps.all.length < count) {
            this._isPopulationMaintained = false;
            this.spawnCreep(qualities);
        } else {
            this._isPopulationMaintained = true;
        }
    }

    tick() {
        this.maintainPopulation([MOVE, CARRY, WORK], 15);
    }
};
