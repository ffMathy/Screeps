
export function getRoomsHandler(): IntentHandlersInObjectForm["rooms"] {
    return {
        "idle": context => {
            return context.memory;
        }
    }
}