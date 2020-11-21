declare type IntentTypes = {
    spawns: IntentType<StructureSpawn, SpawnMemory, [
        ["create", {}],
        IdleIntent
    ]>,
    creeps: IntentType<Creep, CreepMemory, [
        ["walk", {
            target: Position,
            then: IntentsOfType<"creeps">[number]
        }],
        ["harvest", {
            target: Id<Source>
        }],
        ["wait", {
            ticks: number,
            then: IntentsOfType<"creeps">[number]
        }],
        IdleIntent,
        DeleteIntent
    ]>,
    rooms: IntentType<Room, RoomMemory, [
        IdleIntent
    ]>
}

declare type IdleIntent = ["idle", {}];
declare type DeleteIntent = ["delete", {}];

declare type IntentType<TEntity, TMemory, TIntents extends [any, any][]> = {
    entity: TEntity,
    memory: TMemory,
    intents: TIntents
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

declare type IntentHandler<TEntity extends keyof IntentTypes, THandler extends string> = (context: {
    args: PickSpecificElement<THandler, IntentsOfType<TEntity>>,
    memory: IntentTypes[TEntity]["memory"] & {
        intent: [TEntity, PickSpecificElement<THandler, IntentsOfType<TEntity>>]
    },
    entity: IntentTypes[TEntity]["entity"]
}) => any;

declare type IntentHandlersInObjectForm = {
    [P in keyof IntentTypes]: {
        [K in IntentsOfType<P>[number][0]]: IntentHandler<P, K>
    }
}