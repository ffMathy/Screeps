import { getUniqueId } from "main";
import { handleErrorCodes } from "errors";

export const handlers: IntentHandlersInObjectForm = {
    "spawns": {
        "create": context => {
            const uniqueId = getUniqueId();
            context.entity.spawnCreep(
                ["work", "carry", "move"],
                uniqueId,
                {
                    memory: {
                        uniqueId,
                        intent: ["idle", {}]
                    }
                });

            return {
                ...context.memory,
                intent: ["idle", {}]
            };
        },
        "idle": context => {
            return {
                ...context.memory,
                intent: ["create", {}]
            };
        }
    },
    "creeps": {
        "walk": context => {
            handleErrorCodes(() => context.entity.moveTo(context.args.target));
            return context.memory;
        },
        "harvest": context => context.memory,
        "idle": context => {
            return context.memory;
        }
    },
    "rooms": {
        "idle": context => context.memory
    }
}