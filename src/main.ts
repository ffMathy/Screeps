global['__PROFILER_ENABLED__'] = true;

import 'Resources';

import GameDecorator from 'GameDecorator';
import * as Profiler from "profiler";

global['gameDecorator'] = GameDecorator.instance;
global['roomByName'] = (name: string) => GameDecorator.instance.rooms.byName[name];
global['killAllCreeps'] = () => {
    for(let key in Game.creeps)
        Game.creeps[key].suicide();
};

const profiler = Profiler.init();
profiler.stop();
profiler.clear();

global['profiler'] = profiler;

console.log('loaded');

let profiling = false;
let startTick = Game.time;

export const loop = function() {
    GameDecorator.instance.tick();

    if((Game.time - startTick) > 30 && !profiling) {
        profiling = true;

        console.log('profiler started');
        profiler.start();
    }
}
