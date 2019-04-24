global['__PROFILER_ENABLED__'] = true;

import 'Resources';

import GameDecorator from 'GameDecorator';
import * as Profiler from "profiler";

global['gameDecorator'] = GameDecorator.instance;
global['roomByName'] = (name: string) => GameDecorator.instance.rooms.byName[name];

const profiler = Profiler.init();
profiler.start();

global['profiler'] = profiler;

console.log('loaded');

export const loop = function() {
    GameDecorator.instance.tick();
}
