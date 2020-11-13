import { handlers } from "handlers";

var initialized = false;

function initialize() {
    initialized = true;

    for(let spawn of _.values(Game.spawns)) {
        spawn.memory = {
            uniqueId: getUniqueId(),
            intent: "spawn-idle"
        }
    }
}

export function getUniqueId() {
    Memory.uniqueId = +Memory.uniqueId + 1;
    return Memory.uniqueId + "";
}

function tick(type: keyof Game) {
    for(let memoryKey in Memory[type]) {
        Memory[type][memoryKey] = handlers[Memory[memoryKey].intent](
            Game[type][Memory[memoryKey].uniqueId], 
            Memory[memoryKey]);
    }
}

export const loop = function() {
    if(!initialized)
        initialize();
        
    tick("spawns");
    tick("creeps");
}