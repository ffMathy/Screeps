import 'Resources';

import GameDecorator from 'GameDecorator';

export const loop = function() {
    GameDecorator.instance.tick();
}
