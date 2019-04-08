import spawns from 'spawns';
import creeps from 'creeps';
import rooms from 'rooms';

import 'Resources';

export const loop = function() {
    try {
        rooms.tick();
        creeps.tick();
        spawns.tick();
    } catch(e) {
        Game.notify("Error: " + JSON.stringify(e), 360);
        throw e;
    }
}
