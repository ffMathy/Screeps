import _ from "lodash";

export function getWalkableSpiralTiles(position: RoomPosition, innerRadius: number, outerRadius: number) {
    const positions = new Array<RoomPosition>();

    let currentPosition = {
        x: position.x,
        y: position.y
    };
    let currentOffset = 0;
    while(true) {
        const positionOffset = calculateSpiralOffset(currentOffset);
        currentPosition = {
            x: position.x + positionOffset.x,
            y: position.y + positionOffset.y
        };

        const range = position.getRangeTo(currentPosition.x, currentPosition.y);
        currentOffset += range > 1 ? 2 : 1;

        if(range > outerRadius)
            break;

        if(range < innerRadius)
            continue;

        positions.push(new RoomPosition(currentPosition.x, currentPosition.y, position.roomName));
    }

    const result = _.chain(positions)
        .flatMap(x => Game
            .rooms[position.roomName]
            .lookForAt(LOOK_TERRAIN, x.x, x.y)
            .map(terrain => ({
                x: x.x,
                y: x.y,
                terrain
            })))
        .filter(tile => 
            (tile.x !== position.x || 
            tile.y !== position.y) &&
            tile.terrain !== "wall")
        .map(t => new RoomPosition(t.x, t.y, position.roomName))
        .value();

    return result;
}

export function getCenter(origin: Position, positions: Position[]) {
    let x = positions.map(p => p.x - origin.x);
    let avgX = x.reduce((a, b) => a + b) / x.length;

    let y = positions.map(p => p.y - origin.y);
    let avgY = y.reduce((a, b) => a + b) / y.length;

    let center = { x: avgX, y: avgY };
    return center;
}

export function getEntryPoint(origin: RoomPosition) {
    let center = getCenter(origin, this.walkableTiles);

    let multiplierX = 1.5;
    let multiplierY = 1.5;

    let getNewCenter = () => ({
      x: Math.round(center.x * multiplierX) + origin.x,
      y: Math.round(center.y * multiplierY) + origin.y
    });

    let newCenter = getNewCenter();
    let minimumRadius = 2;
    let multiplierIncrement = 0.2;

    while(Math.abs(newCenter.x - origin.x) <= minimumRadius && Math.abs(newCenter.y - origin.y) <= minimumRadius) {
      multiplierX += multiplierIncrement;
      multiplierY += multiplierIncrement;

      newCenter = getNewCenter();
    }

    while(Math.abs(newCenter.x - origin.x) === 1) {
      multiplierX += multiplierIncrement;
      newCenter = getNewCenter();
    }

    while(Math.abs(newCenter.y - origin.y) === 1) {
      multiplierY += multiplierIncrement;
      newCenter = getNewCenter();
    }

    return newCenter;
  }

function calculateSpiralOffset(offset: number) {
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