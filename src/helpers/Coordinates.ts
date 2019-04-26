export const enum Direction {
    TOP = 1,
    TOP_RIGHT = 2,
    RIGHT = 3,
    BOTTOM_RIGHT = 4,
    BOTTOM = 5,
    BOTTOM_LEFT = 6,
    LEFT = 7,
    TOP_LEFT = 8
}

export default class Coordinates {
    static directionFromCoordinates(a: RoomPosition, b: RoomPosition) {
        let dx = b.x - a.x;
        let dy = b.y - a.y;

        if (dx === -1 && dy === -1)
            return Direction.TOP_LEFT;

        else if (dx === 0 && dy === -1)
            return Direction.TOP;

        else if (dx === 1 && dy === -1)
            return Direction.TOP_RIGHT;

        else if (dx === -1 && dy === 0)
            return Direction.LEFT;

        else if (dx === 1 && dy === 0)
            return Direction.RIGHT;

        else if (dx === -1 && dy === 1)
            return Direction.BOTTOM_LEFT;

        else if (dx === 0 && dy === 1)
            return Direction.BOTTOM;

        else if (dx === 1 && dy === 1)
            return Direction.BOTTOM_RIGHT;

        else
            throw new Error('Unknown direction from ' + dx + '/' + dy);
    }

    static calculateSpiralOffset(offset: number) {
        var r = Math.floor((Math.sqrt(offset + 1) - 1) / 2) + 1;
        var p = (8 * r * (r - 1)) / 2;
        var en = r * 2;
        var a = (1 + offset - p) % (r * 8);

        var pos = [0, 0, r];
        switch (Math.floor(a / (r * 2))) {
            case 0:
                {
                    pos[0] = a - r;
                    pos[1] = -r;
                }
                break;
            case 1:
                {
                    pos[0] = r;
                    pos[1] = (a % en) - r;

                }
                break;
            case 2:
                {
                    pos[0] = r - (a % en);
                    pos[1] = r;
                }
                break;
            case 3:
                {
                    pos[0] = -r;
                    pos[1] = r - (a % en);
                }
                break;
        }
        return { x: pos[0], y: pos[1] };
    }
}
