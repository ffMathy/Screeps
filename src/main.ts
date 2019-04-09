import 'Resources';

import GameDecorator from 'GameDecorator';
global['gameDecorator'] = GameDecorator.instance;

export const loop = function() {
    GameDecorator.instance.tick();
}
