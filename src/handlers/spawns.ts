import { handleErrorCodes } from "errors";
import { getUniqueId } from "main";

export function getSpawnsHandler(): IntentHandlersInObjectForm["spawns"] {
    return {
        "create": context => {
            const bodyparts: BodyPartConstant[] = [
                "work",
                "carry",
                "move"
            ];
            const cost = getBodyCost(bodyparts);
            if(cost > context.entity.store.getUsedCapacity(RESOURCE_ENERGY))
                return context.memory;

            const name = getUniqueId().toString();
            const memory: CreepMemory = {
                intent: ["idle", {}],
                slotId: null,
                name
            };

            handleErrorCodes(
                () => context.entity.spawnCreep(
                    bodyparts,
                    name,
                    {
                        memory
                    }));

            return {
                ...context.memory
            };
        },
        "idle": context => {
            return {
                ...context.memory,
                intent: ["create", {}]
            };
        }
    };
}

function getBodyCost(body: BodyPartConstant[])
{
    let sum = 0;
    for (let i in body)
        sum += BODYPART_COST[body[i]];

    return sum;
}