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

declare interface CreepMemory {
    intent: IntentTypes["creeps"]["intents"][number],
    name: string,
    slotId: string
}

declare interface SpawnMemory {
    intent: IntentTypes["spawns"]["intents"][number],
    id: Id<StructureSpawn>
}

declare interface RoomMemory {
    intent: IntentTypes["rooms"]["intents"][number],
    sources: Array<{
        id: Id<Source>,
        slotIds: Array<string>
    }>,
    visuals: Visuals,
    name: string
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