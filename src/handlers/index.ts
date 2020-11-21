import { getCreepsHandler } from './creeps/handler';
import { getRoomsHandler } from './rooms/handler';
import { getSpawnsHandler } from './spawns';

export function getHandlers(): IntentHandlersInObjectForm {
    return {
        "spawns": getSpawnsHandler(),
        "creeps": getCreepsHandler(),
        "rooms": getRoomsHandler()
    }
}