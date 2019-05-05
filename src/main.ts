let doProfiling = true;
global['__PROFILER_ENABLED__'] = doProfiling;

import GameDecorator from 'GameDecorator';
import * as Profiler from "profiler";

if(doProfiling) {
    const profiler = Profiler.init();
    profiler.stop();
    profiler.clear();

    global['profiler'] = profiler;
}

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

global['getMainRoom'] = () => {
    return GameDecorator.instance.rooms.all[0];
};

global['killAllCreepsExcept'](30);

global['gameDecorator'] = GameDecorator.instance;

console.log('loaded');

let lastError = null;
let isProfiling = false;
let startTick = Game.time;

export const loop = function() {
    if(lastError) {
        return;
    }

    try {
        GameDecorator.instance.tick();
    } catch(ex) {
        lastError = ex;
        throw ex;
    }

    if(doProfiling && (Game.time - startTick) > 30 && !isProfiling) {
        isProfiling = true;

        console.log('profiler started');
        global['profiler'].start();
    }
}
