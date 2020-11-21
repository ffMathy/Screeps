import { handleErrorCodes } from "errors";
import _ from "lodash";
import { getUniqueId } from "main";

export function getSpawnsHandler(): IntentHandlersInObjectForm["spawns"] {
    return {
        "create": context => {
            if(context.entity.spawning)
                return context.memory;

            const bodyparts: BodyPartConstant[] = [
                "work",
                "carry",
                "move"
            ];
            const cost = getBodyCost(bodyparts);
            if(cost > context.entity.store.getUsedCapacity(RESOURCE_ENERGY)) {
                return {
                    ...context.memory,
                    intent: ["idle", {
                        cost
                    }]
                };
            }

            const type = getMostNeededCreepType(context.entity);

            const name = type + "-" + getUniqueId().toString();
            const memory: CreepMemory = {
                intent: ["idle", {}],
                slotId: null,
                roomName: context.entity.room.name,
                type,
                name
            };

            handleErrorCodes(
                () => context.entity.spawnCreep(
                    bodyparts,
                    name,
                    {
                        memory
                    }));

            context.entity.room.memory.creepsByType[memory.type].push(memory.name);

            return {
                ...context.memory
            };
        },
        "idle": context => {
            context.entity.room.visual.text("😴", context.entity.pos);

            if(context.args.cost && context.entity.store.getUsedCapacity(RESOURCE_ENERGY) < context.args.cost) {
                return {
                    ...context.memory,
                    lastIdleTick: Game.time
                }
            }

            return {
                ...context.memory,
                intent: ["create", {}]
            };
        }
    };
}

function isAtOptimalCapacity(entity: StructureSpawn): boolean {
    return (Game.time - entity.memory.lastIdleTick) > 15;
}

function getMostNeededCreepType(entity: StructureSpawn): CreepType {
    const creepsByType = entity.room.memory.creepsByType;
    if(creepsByType.transporter.length < 1)
        return "transporter";

    const availableSourceSlotCount = _.sumBy(
        entity.room.memory.sources,
        x => x.slotIds
            .filter(s => !Memory.slots[s].reservedBy)
            .length);
    if(availableSourceSlotCount > 0)
        return "harvester";

    const totalSourceSlotCount = _.sumBy(
        entity.room.memory.sources,
        x => x.slotIds.length);
    if(!isAtOptimalCapacity(entity) && creepsByType.transporter.length < totalSourceSlotCount / 2)
        return "transporter";

    if(creepsByType.builder.length < 1)
        return "builder";

    if(creepsByType.upgrader.length < 10)
        return "upgrader";

    return "builder";
}

function getBodyCost(body: BodyPartConstant[])
{
    let sum = 0;
    for (let i in body)
        sum += BODYPART_COST[body[i]];

    return sum;
}