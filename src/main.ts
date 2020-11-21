import { getWalkableSpiralTiles } from "coordinates";
import errorMapper from "error-mapper";
import { getHandlers } from "handlers/all";
import _ = require("lodash");

function initialize() {
    Memory.isInitialized = true;

    Memory.slots = {};

    for(let spawn of _.values(Game.spawns)) {
        spawn.memory = {
            intent: ["idle", {}],
            id: spawn.id
        }
    }

    for(let creep of _.values(Game.creeps)) {
        creep.memory = {
            intent: ["idle", {}],
            name: creep.name,
            slotId: null
        };
    }

    for(let room of _.values(Game.rooms)) {
        room.memory = {
            name: room.name,
            intent: ["idle", {}],
            sources: [],
            visuals: {
                circles: []
            }
        }

        for(let source of room.find(FIND_SOURCES)) {
            const slots = getWalkableSpiralTiles(source.pos, 1)
                .map(t => ({
                    reservedBy: null,
                    position: {
                        x: t.x,
                        y: t.y
                    },
                    id: t.roomName + "/" + t.x + "/" + t.y
                }))
            room.memory.sources.push({
                id: source.id,
                slotIds: slots.map(x => x.id)
            });
            for(let slot of slots) {
                Memory.slots[slot.id] = {
                    position: slot.position,
                    reservedBy: slot.reservedBy
                }
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

export function getUniqueId() {
    Memory.uniqueId = (+Memory.uniqueId + 1) % 1000;
    return (Memory.uniqueId + (Game.time * 1000)) + "";
}

function tick(type: keyof Game) {
    const typeMemory = Memory[type];

    const handlers = getHandlers();
    for(let typeMemoryKey in typeMemory) {
        const specificMemory = typeMemory[typeMemoryKey];

        const intent = specificMemory.intent;
        const intentKey = intent[0];

        const handler = handlers[type][intentKey];

        const entity = specificMemory.id ?
            Game.getObjectById(specificMemory.id) :
            Game[type][specificMemory.name];

        const context = {
            args: intent[1],
            entity: entity || null, 
            memory: specificMemory
        };

        if(!entity) {
            console.log('deleting', typeMemoryKey);

            const deleteHandler = handlers[type]["delete"];
            if(deleteHandler)
                deleteHandler(context);

            delete typeMemory[typeMemoryKey];
            continue;
        }

        if(!handler) {
            throw new Error("No handler for type and intent " + JSON.stringify(specificMemory));
        }

        typeMemory[typeMemoryKey] = handler(context);
    }
}

global["clear"] = () => {
    for(let key of _.keys(Memory))
        delete Memory[key];
}

export const loop = function() {
    errorMapper(() => {
        if(!Memory.isInitialized)
            initialize();
            
        tick("spawns");
        tick("creeps");
        tick("rooms");

        for(let room of _.values(Game.rooms)) {
            for(let circle of room.memory.visuals.circles)
                room.visual.circle(circle.position.x, circle.position.y, circle.style);
        }
    })();
}