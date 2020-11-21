declare interface Memory {
    population: number,
    uniqueId: number
}

declare interface CreepMemory {
    intent: IntentTypes["creeps"]["intents"][number],
    uniqueId: string
}

declare interface SpawnMemory {
    intent: IntentTypes["spawns"]["intents"][number],
    uniqueId: string
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

declare interface RoomMemory {
    intent: IntentTypes["rooms"]["intents"][number],
    uniqueId: string,
    sources: Array<{
        id: string,
        slots: Array<{
            position: Position,
            reservedBy: string
        }>
    }>,
    visuals: Visuals
}