import { errorMapper } from "errors";
import { getHandlers } from "handlers";
import { buildHighway } from "handlers/rooms/highway";
import { initialize } from "initialization";
import _ = require("lodash");

export function getUniqueId() {
    Memory.uniqueId = (+(Memory.uniqueId || 0) + 1) % 1000;
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
    for(let constructionSite of _.values(Game.constructionSites))
        constructionSite.remove();

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