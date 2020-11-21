import { handleErrorCodes } from "errors";

import _ from "lodash";

export function getCreepsHandler(): IntentHandlersInObjectForm["creeps"] {
    return {
        "walk": context => {
            if(context.entity.pos.x === context.args.target.x && context.entity.pos.y === context.args.target.y) {
                return {
                    ...context.memory,
                    intent: context.args.then
                };
            }

            return handleErrorCodes(
                () => context.entity.moveTo(
                    new RoomPosition(
                        context.args.target.x,
                        context.args.target.y,
                        context.entity.room.name)),
                {
                    [OK]: () => context.memory,
                    [ERR_BUSY]: () => context.memory
                });
        },
        "harvest": context => {
            if(context.entity.store.getFreeCapacity() === 0) {
                context.entity.drop(RESOURCE_ENERGY);
            }

            const source = Game.getObjectById(context.args.target);

            return handleErrorCodes(() => context.entity.harvest(source), {
                [OK]: () => context.memory,
                [ERR_NOT_ENOUGH_RESOURCES]: () => {
                    return {
                        ...context.memory,
                        intent: ["wait", {
                            ticks: 3,
                            then: context.memory.intent
                        }]
                    }
                }
            });
        },
        "wait": context => {
            const ticks = context.args.ticks;
            if(ticks === 0) {
                return {
                    ...context.memory,
                    intent: context.args.then
                };
            }

            return {
                ...context.memory,
                intent: ["wait", {
                    ticks: ticks - 1,
                    then: null
                }]
            }
        },
        "delete": context => {
            const slotId = context.memory.slotId;
            if(slotId)
                Memory.slots[slotId].reservedBy = null;
        },
        "idle": pickIntent
    };
}

export var pickIntent: IntentHandler<"creeps", "idle"> = (context) => {
    if(!context.entity.id)
        return context.memory;

    const room = context.entity.room;

    const availableSpot = _.chain(room.memory.sources)
        .flatMap(x => x
            .slotIds
            .map(s => ({
                slot: Memory.slots[s],
                source: x
            })))
        .find(x => !x.slot.reservedBy)
        .value();

    if(!availableSpot)
        return context.memory;

    const slot = availableSpot.slot;
    slot.reservedBy = context.entity.id;

    return {
        ...context.memory,
        slot: slot.position,
        intent: ["walk", {
            target: slot.position,
            then: ["harvest", {
                target: availableSpot.source.id
            }]
        }]
    }
}