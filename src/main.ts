import spawns from 'spawns';
import creeps from 'creeps';
import rooms from 'rooms';

import 'Resources';

export const loop = function() {
    rooms.tick();
    creeps.tick();
    spawns.tick();
}
