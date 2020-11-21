import { getWalkableSpiralTiles } from "coordinates";
import { handlers } from "handlers";
import { LoDashStatic } from "lodash";
declare var _: LoDashStatic;

var initialized = false;

function initialize() {
    initialized = true;

    for(let spawn of _.values(Game.spawns)) {
        spawn.memory = {
            uniqueId: spawn.name,
            intent: ["idle", {}]
        }
    }

    for(let room of _.values(Game.rooms)) {
        room.memory = {
            uniqueId: room.name,
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
                    }
                }))
            room.memory.sources.push({
                id: source.id,
                slots: slots
            });

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
    Memory.uniqueId = +Memory.uniqueId + 1;
    return Memory.uniqueId + "";
}

function tick(type: keyof Game) {
    const typeMemory = Memory[type];
    for(let typeMemoryKey in typeMemory) {
        const intent = typeMemory[typeMemoryKey].intent;
        typeMemory[typeMemoryKey] = handlers[type][intent[0]]({
            args: intent[1],
            entity: Game[type][typeMemory[typeMemoryKey].uniqueId], 
            memory: typeMemory[typeMemoryKey]
        });
    }
}

export const loop = function() {
    if(!initialized)
        initialize();
        
    tick("spawns");
    tick("creeps");
    tick("rooms");

    for(let room of _.values(Game.rooms)) {
        for(let circle of room.memory.visuals.circles)
            room.visual.circle(circle.position.x, circle.position.y, circle.style);
    }
}