global['__PROFILER_ENABLED__'] = true;

import GameDecorator from 'GameDecorator';
import * as Profiler from "profiler";

global['roomByName'] = (name: string) => GameDecorator.instance.rooms.byName[name];
global['killAllCreepsExcept'] = (except: number) => {
    let creepCount = 0;
    for(let key in Game.creeps) {
        creepCount++;
        if(creepCount > except)
            Game.creeps[key].suicide();
    }
};
global['killAllCreeps'] = () => global['killAllCreeps'](0);
global['removeAllConstructionSites'] = () => {
    for(let room of GameDecorator.instance.rooms.all) {
        for(let constructionSite of room.constructionSites)
            constructionSite.remove();
    }
}

global['killAllCreepsExcept'](30);

global['gameDecorator'] = GameDecorator.instance;

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
