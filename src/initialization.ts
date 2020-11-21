import { getWalkableSpiralTiles } from "coordinates";
import _ from "lodash";

export function initialize() {
    Memory.isInitialized = true;

    Memory.slots = {};

    initializeSpawns();
    initializeSources();
    initializeCreeps();
}

function initializeCreeps() {
    for (let creep of _.values(Game.creeps)) {
        const type: CreepType = "harvester";
        creep.memory = {
            intent: ["idle", {}],
            name: creep.name,
            slotId: null,
            type: type,
            roomName: creep.room.name
        };
        creep.room.memory.creepsByType[type].push(creep.name);
    }
}

function initializeSources() {
    for (let room of _.values(Game.rooms)) {
        room.memory = {
            name: room.name,
            currentRcl: 0,
            intent: ["idle", {}],
            sources: [],
            visuals: {
                circles: []
            },
            creepsByType: {
                harvester: [],
                transporter: [],
                upgrader: [],
                builder: []
            },
            highways: []
        };

        for (let source of room.find(FIND_SOURCES)) {
            const slots = getWalkableSpiralTiles(source.pos, 1, 1)
                .map(t => ({
                    reservedBy: null,
                    position: {
                        x: t.x,
                        y: t.y
                    },
                    id: t.roomName + "/" + t.x + "/" + t.y
                }));
            room.memory.sources.push({
                id: source.id,
                slotIds: slots.map(x => x.id)
            });
            for (let slot of slots) {
                Memory.slots[slot.id] = {
                    position: slot.position,
                    reservedBy: slot.reservedBy
                };
            }

            room.memory.visuals.circles.push(...slots.map(slot => ({
                position: {
                    x: slot.position.x,
                    y: slot.position.y
                },
                style: {
                    stroke: '#00FF00'
                }
            })));
        }
    }
}

function initializeSpawns() {
    for (let spawn of _.values(Game.spawns)) {
        spawn.memory = {
            intent: ["idle", {}],
            id: spawn.id,
            lastIdleTick: Game.time
        };
    }
}
