import { getWalkableSpiralTiles } from "coordinates";
import { handleErrorCodes } from "errors";
import _ from "lodash";
import { buildHighway } from "./highway";

export function getRoomsHandler(): IntentHandlersInObjectForm["rooms"] {
    return {
        "adapt": context => {
            const nextRcl = context.memory.currentRcl + 1;

            if(context.memory.currentRcl <= context.entity.controller.level) {
                console.log('upgrade', context.memory.currentRcl);

                if(context.memory.currentRcl === 1) {
                    const positions = _.chain(context.entity.find(FIND_MY_SPAWNS))
                        .flatMap(x => getWalkableSpiralTiles(x.pos, 2, 10))
                        .take(5)
                        .value();
                    for(let position of positions) {
                        handleErrorCodes(() => context.entity.createConstructionSite(
                            position.x,
                            position.y,
                            STRUCTURE_ROAD));
                    }
                }

                if(context.memory.currentRcl === 2) {
                    const highway = buildHighway(context.entity.name);

                    return {
                        ...context.memory,
                        currentRcl: nextRcl,
                        highways: highway.map(x => ({
                            x: x.x,
                            y: x.y
                        }))
                    };
                }

                return {
                    ...context.memory,
                    currentRcl: nextRcl,
                    intent: ["adapt", {}]
                }
            }

            return {
                ...context.memory,
                intent: ["idle", {}]
            }
        },
        "idle": context => {
            if(context.memory.currentRcl !== context.entity.controller.level) {
                return {
                    ...context.memory,
                    intent: ["adapt", {}]
                }
            }

            return context.memory;
        }
    }
}