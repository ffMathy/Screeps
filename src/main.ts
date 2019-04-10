import 'Resources';

import GameDecorator from 'GameDecorator';
global['gameDecorator'] = GameDecorator.instance;

console.log('loaded');

export const loop = function() {
    GameDecorator.instance.tick();
}
