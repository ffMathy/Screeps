import type {LoDashStatic} from 'lodash';
import { getCreepsHandler } from './creeps';
import { getRoomsHandler } from './rooms';
import { getSpawnsHandler } from './spawns';

declare var _: LoDashStatic

export function getHandlers(): IntentHandlersInObjectForm {
    return {
        "spawns": getSpawnsHandler(),
        "creeps": getCreepsHandler(),
        "rooms": getRoomsHandler()
    }
}