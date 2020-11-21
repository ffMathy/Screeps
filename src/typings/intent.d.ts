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
    },
    rooms: {
        entity: Room,
        memory: RoomMemory,
        intents: [
            ["idle", {}]
        ]
    }
}

declare type IntentTuple<
    T extends string, 
    K extends object
> = [T, K]

declare type IntentsOfType<T extends keyof IntentTypes> = 
    IntentTypes[T]["intents"];

type PickSpecificElement<TKey, TArray> = TArray extends [[infer TFirst, infer TSecond], ...infer TRest] ?
    (TFirst extends TKey ? 
        TSecond :
        PickSpecificElement<TKey, TRest>) :
    never;

declare type IntentHandlersInObjectForm = {
    [P in keyof IntentTypes]: {
        [K in IntentsOfType<P>[number][0]]: (context: {
            args: PickSpecificElement<K, IntentsOfType<P>>,
            memory: IntentTypes[P]["memory"],
            entity: IntentTypes[P]["entity"]
        }) => IntentTypes[P]["memory"]
    }
}