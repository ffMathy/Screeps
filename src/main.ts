import 'Resources';

import GameDecorator from 'GameDecorator';
global['gameDecorator'] = GameDecorator.instance;
global['roomByName'] = (name: string) => GameDecorator.instance.rooms.byName[name];

console.log('loaded');

export const loop = function() {
    GameDecorator.instance.tick();
}
