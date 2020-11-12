import { intentsByName } from "intents/spawn";

var initialized = false;

function initialize() {
    initialized = true;


}

export function getUniqueId() {
    Memory.uniqueId = +Memory.uniqueId + 1;
    return Memory.uniqueId + "";
}

export const loop = function() {
    if(!initialized)
        initialize();
        
    for(let spawn of _.values(Game.spawns))
        tickSpawn
}