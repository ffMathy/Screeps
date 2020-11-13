declare interface Memory {
    population: number,
    uniqueId: number
}

declare interface CreepMemory {
    intent: IntentTypes["creeps"]["intents"],
    uniqueId: string,
}

declare interface SpawnMemory {
    intent: IntentTypes["spawns"]["intents"],
    uniqueId: string,
}

declare type IntentTypes = {
    spawns: {
        entity: StructureSpawn, 
        memory: SpawnMemory, 
        intents: [
            ["idle", {}],
            ["create", {}]
        ]
    },
    creeps: {
        entity: Creep, 
        memory: CreepMemory, 
        intents: [
            ["idle", {}],
            ["walk", {
                target: RoomPosition
            }],
            ["harvest", {
                target: Source
            }]
        ]
    }
}

declare type IntentTuple<
    T extends string, 
    K extends object
> = [T, K]

declare type IntentsOfType<T extends keyof IntentTypes> = 
    IntentTypes[T]["intents"];

declare type IntentHandlersInObjectForm = {
    [P in keyof IntentTypes]: {
        [K in IntentsOfType<P>[number][0]]: K extends IntentsOfType<P>[number]
    }
}


declare type PickSpecificElement<TKey, TArray> = TArray extends [[infer TFirst, infer TSecond], ...infer TRest] ?
    (TFirst extends TKey ? 
        TSecond :
        PickSpecificElement<TKey, TRest>) :
    never;