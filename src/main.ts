import GameDecorator from 'GameDecorator';

let lastError = null;

export const loop = function() {
    if(lastError) {
        console.log(lastError);
        return;
    }

    try {
        GameDecorator.instance.tick();
    } catch(ex) {
        lastError = ex;
        throw ex;
    }
}