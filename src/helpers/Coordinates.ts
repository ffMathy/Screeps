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
    static roomPositionToNumber(position: RoomPosition) {
        return position.x + 50 * position.y;
    }

    static rotateDirectionRight(direction: Direction) {
        direction = (direction + 1) % 9;
        if (direction === 0)
            direction++;

        return direction;
    }

    static rotateDirectionLeft(direction: Direction) {
        direction--;
        if (direction === 0)
            direction = 8;

        return direction % 9;
    }

    static coordinatesFromDirection(direction: Direction) {
        switch (direction) {
            case Direction.TOP_LEFT:
                return { x: -1, y: -1 };

            case Direction.TOP:
                return { x: 0, y: -1 };

            case Direction.TOP_RIGHT:
                return { x: 1, y: -1 };

            case Direction.RIGHT:
                return { x: 1, y: 0 };

            case Direction.BOTTOM_RIGHT:
                return { x: 1, y: 1 };

            case Direction.BOTTOM:
                return { x: 0, y: 1 };

            case Direction.BOTTOM_LEFT:
                return { x: -1, y: 1 };

            case Direction.LEFT:
                return { x: -1, y: 0 };

            default:
                throw new Error('Unknown direction: ' + direction + '.');
        }
    }

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
