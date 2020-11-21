import { getCenter } from "coordinates";
import { handleErrorCodes } from "errors";
import _ from "lodash";

function getHighwayPositions(roomName: string): RoomPosition[] {
    const types = [
        FIND_SOURCES,
        FIND_MY_SPAWNS
    ];
    const room = Game.rooms[roomName];

    const positions = _.chain(types)
        .flatMap(x => room.find(x))
        .map(x => x.pos)
        .value();
    positions.push(room.controller.pos);

    const averagePosition = getCenter(
        { x: 0, y: 0},
        positions);
    const positionClosestToAverage = _.chain(positions)
        .orderBy(x => x
            .findPathTo(
                averagePosition.x, 
                averagePosition.y, 
                getHighwayPlanningOptions([]))
            .length)
        .first()
        .value();

    return _.chain(positions)
        .filter(x => x !== positionClosestToAverage)
        .flatMap(x => [x, positionClosestToAverage])
        .value();
}

function getHighwayPlanningOptions(tryToAvoidPositions: RoomPosition[]): FindPathOpts {
    return {
        ignoreCreeps: true,
        ignoreRoads: true,
        range: 1,
        costCallback: (_, matrix) => {
            for(let position of tryToAvoidPositions)
                matrix.set(position.x, position.y, 254);

            return matrix;
        }
    };
}

export function buildHighway(roomName: string) {
    const keyPositions = getHighwayPositions(roomName);

    const stepPositions = new Array<RoomPosition>();

    const colors = ['red', 'green', 'purple', 'blue', 'orange', 'brown', 'yellow'];
    let colorOffset = 0;

    for(let i=1;i<keyPositions.length;i++) {
        const currentPosition = keyPositions[i];
        const previousPosition = keyPositions[i-1];

        const path = previousPosition.findPathTo(
            currentPosition.x, 
            currentPosition.y,
            getHighwayPlanningOptions(stepPositions));
        const color = colors[colorOffset++ % colors.length];
        for(let step of path) {
            stepPositions.push(new RoomPosition(step.x, step.y, roomName));
            Game.rooms[currentPosition.roomName].visual.circle(
                step.x,
                step.y,
                {
                    stroke: color
                });
            handleErrorCodes(() => Game.rooms[currentPosition.roomName].createConstructionSite(
                step.x,
                step.y,
                STRUCTURE_ROAD), {
                    [ERR_INVALID_TARGET]: () => {}
                });
        }
    }

    return stepPositions;
}