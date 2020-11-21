import { handleErrorCodes } from "errors";

import _ from "lodash";

export function getCreepsHandler(): IntentHandlersInObjectForm["creeps"] {
    return {
        "walk": context => {
            if(context.entity.fatigue > 0)
                return context.memory;

            const distanceX = Math.abs(context.args.target.x - context.entity.pos.x);
            const distanceY = Math.abs(context.args.target.y - context.entity.pos.y);
            if(distanceX <= context.args.proximity && distanceY <= context.args.proximity) {
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
                    [ERR_BUSY]: () => context.memory,
                    [ERR_NO_PATH]: () => {
                        console.log("no path found - perhaps due to other creeps stuck?");
                        return context.memory;
                    }
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
        "transfer": context => {
            return handleErrorCodes(
                () => context.entity.transfer(
                    Game.getObjectById(context.args.target), 
                    RESOURCE_ENERGY),
                {
                    [OK]: () => context.memory,
                    [ERR_NOT_ENOUGH_RESOURCES]: () => ({
                        ...context.memory,
                        intent: ["idle", {}]
                    })
                });
        },
        "upgrade": context => {
            return handleErrorCodes(
                () => context.entity.upgradeController(
                    Game.getObjectById(context.args.target)),
                {
                    [OK]: () => context.memory,
                    [ERR_NOT_ENOUGH_RESOURCES]: () => ({
                        ...context.memory,
                        intent: ["idle", {}]
                    })
                });
        },
        "build": context => {
            return handleErrorCodes(
                () => context.entity.build(
                    Game.getObjectById(context.args.target)),
                {
                    [OK]: () => context.memory,
                    [ERR_NOT_ENOUGH_RESOURCES]: () => ({
                        ...context.memory,
                        intent: ["idle", {}]
                    })
                });
        },
        "take": context => {
            return handleErrorCodes(
                () => context.entity.pickup(Game.getObjectById(context.args.target)),
                {
                    [OK]: () => context.memory,
                    [ERR_INVALID_TARGET]: () => {
                        console.log("could not take from target.");
                        return {
                            ...context.memory,
                            intent: ["idle", {}]
                        }
                    },
                    [ERR_FULL]: () => ({
                        ...context.memory,
                        intent: ["idle", {}]
                    })
                });
        },
        "delete": context => {
            const slotId = context.memory.slotId;
            if(slotId)
                Memory.slots[slotId].reservedBy = null;
                
            _.remove(
                Game.rooms[context.memory.roomName].memory.creepsByType[context.memory.type],
                x => x === context.memory.name);

            return null;
        },
        "idle": pickIntent
    };
}

export var pickIntent: IntentHandler<"creeps", "idle"> = (context) => {
    const isStillSpawning = !context.entity.id;
    if(isStillSpawning)
        return context.memory;

    const intentPickers = getIntentPickers();
    return intentPickers[context.memory.type](context);
}

function getIntentPickers(): {[T in CreepType]: IntentHandler<"creeps", "idle">} {
    return {
        harvester: context => {
            const room = context.entity.room;

            const availableSpot = _.chain(room.memory.sources)
                .flatMap(x => x
                    .slotIds
                    .map(s => ({
                        slot: Memory.slots[s],
                        slotId: s,
                        source: x
                    })))
                .find(x => !x.slot.reservedBy)
                .value();

            if(!availableSpot) {
                context.entity.suicide();
                return context.memory;
            }

            const slot = availableSpot.slot;
            slot.reservedBy = context.entity.id;

            return {
                ...context.memory,
                slotId: availableSpot.slotId,
                intent: ["walk", {
                    target: slot.position,
                    proximity: 0,
                    then: ["harvest", {
                        target: availableSpot.source.id
                    }]
                }]
            }
        },
        transporter: context => {
            if(context.entity.store.getUsedCapacity() > 0) {
                const spawn = _.chain(Game.spawns)
                    .keys()
                    .map(x => Game.spawns[x])
                    .first()
                    .value();
                return {
                    ...context.memory,
                    intent: ["walk", {
                        target: spawn.pos,
                        proximity: 1,
                        then: ["transfer", {
                            target: spawn.id
                        }]
                    }]
                }
            }

            const availableEnergyOnGround = _.chain(context.entity.room.find(FIND_DROPPED_RESOURCES))
                .orderBy(x => -x.amount)
                .first()
                .value();
            if(!availableEnergyOnGround)
                return context.memory;

            return {
                ...context.memory,
                intent: ["walk", {
                    target: availableEnergyOnGround.pos,
                    proximity: 1,
                    then: ["take", {
                        target: availableEnergyOnGround.id
                    }]
                }]
            }
        },
        upgrader: context => {
            if(context.entity.store.getUsedCapacity() > 0) {
                const controller = _.chain(Game.rooms)
                    .keys()
                    .map(x => Game.rooms[x])
                    .first()
                    .value()
                    .controller;
                return {
                    ...context.memory,
                    intent: ["walk", {
                        target: controller.pos,
                        proximity: 3,
                        then: ["upgrade", {
                            target: controller.id
                        }]
                    }]
                }
            }

            const availableEnergyOnGround = context.entity.room.find(FIND_DROPPED_RESOURCES);
            if(availableEnergyOnGround.length === 0)
                return context.memory;

            const firstEnergy = availableEnergyOnGround[0];
            return {
                ...context.memory,
                intent: ["walk", {
                    target: firstEnergy.pos,
                    proximity: 1,
                    then: ["take", {
                        target: firstEnergy.id
                    }]
                }]
            }
        },
        builder: context => {
            if(context.entity.store.getUsedCapacity() > 0) {
                const constructionSite = _.chain(Game.rooms)
                    .keys()
                    .map(x => Game.rooms[x])
                    .first()
                    .value()
                    .find(FIND_CONSTRUCTION_SITES)[0];
                if(!constructionSite)
                    return context.memory;

                return {
                    ...context.memory,
                    intent: ["walk", {
                        target: constructionSite.pos,
                        proximity: 3,
                        then: ["build", {
                            target: constructionSite.id
                        }]
                    }]
                }
            }

            const availableEnergyOnGround = context.entity.room.find(FIND_DROPPED_RESOURCES);
            if(availableEnergyOnGround.length === 0)
                return context.memory;

            const firstEnergy = availableEnergyOnGround[0];
            return {
                ...context.memory,
                intent: ["walk", {
                    target: firstEnergy.pos,
                    proximity: 1,
                    then: ["take", {
                        target: firstEnergy.id
                    }]
                }]
            }
        }
    }
}