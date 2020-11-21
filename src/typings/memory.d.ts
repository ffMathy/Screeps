declare interface Memory {
    slots: {
        [id: string]: {
            position: Position,
            reservedBy: Id<Creep>
        }
    };
    uniqueId: number;
    isInitialized: boolean;
}

declare type CreepType = 
    "transporter" |
    "harvester" |
    "upgrader" |
    "builder";

declare interface CreepMemory {
    intent: IntentTypes["creeps"]["intents"][number],
    name: string,
    slotId: string,
    type: CreepType,
    roomName: string
}

declare interface SpawnMemory {
    intent: IntentTypes["spawns"]["intents"][number],
    id: Id<StructureSpawn>,
    lastIdleTick: number
}

declare interface RoomMemory {
    intent: IntentTypes["rooms"]["intents"][number],
    sources: Array<{
        id: Id<Source>,
        slotIds: Array<string>
    }>,
    visuals: Visuals,
    name: string,
    creepsByType: {
        [P in CreepType]: string[]
    },
    currentRcl: number,
    highways: Position[]
}

declare interface Position {
    x: number,
    y: number
}

declare interface Visuals {
    circles: Array<{
        position: Position,
        style: CircleStyle
    }>
}