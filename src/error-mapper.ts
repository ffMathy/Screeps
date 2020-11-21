import { escape } from 'lodash';
import { MappedPosition, SourceMapConsumer } from 'source-map'; // leave it at version ^0.6.1. ^0.7 is async only.

export default function errorMapper(tick: () => void): () => void {
    return () => {
        try {
            tick();
        } catch (error) {
            if (error instanceof Error) {
                const isSimulation: boolean = ('sim' in Game.rooms);
                if (isSimulation) {
                    printOriginalError(error);
                } else {
                    printStackTrace(error);
                }
            } else {
                throw error;
            }
        }
    };
}

// tslint:disable-next-line: no-var-requires
const consumer: SourceMapConsumer = new SourceMapConsumer(require('main.js.map')); // High CPU usage!
const cache: { [key: string]: string } = {};

function getSourceMapStackTrace(error: Error | string): string {
    const originalStackTrace: string = error instanceof Error ? error.stack as string : error;
    if (cache[originalStackTrace]) {
        return cache[originalStackTrace];
    }

    const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
    let match: RegExpExecArray | null;
    let outputStackTrace: string = error.toString();

    // tslint:disable-next-line:no-conditional-assignment
    while ((match = re.exec(originalStackTrace)) !== null) {
        const nameFromOriginalStackTrace: string = match[1];
        const isStackTraceLineControlledByMe: boolean = match[2] === 'main';
        const lineFromOriginalStackTrace: number = parseInt(match[3], 10);
        const columnFromOriginalStackTrace: number = parseInt(match[4], 10);

        if (!isStackTraceLineControlledByMe) {
            break;
        }

        const { name, source, line, column }: MappedPosition = consumer.originalPositionFor({
            column: columnFromOriginalStackTrace,
            line: lineFromOriginalStackTrace,
        });

        if (!line) {
            break;
        }

        const finalName = (name) ? name : (nameFromOriginalStackTrace) ? nameFromOriginalStackTrace : '';

        outputStackTrace += stripWebpackFromStackTrace(
            `\n    at ${finalName}(${source}:${line}:${column})`,
        );
    }

    cache[originalStackTrace] = outputStackTrace;
    return outputStackTrace;
}

function printOriginalError(error: Error) {
    const message = `Source maps don't work in the Simulation mode.`;
    console.log(`<span style="color: tomato">${message}\n${escape(error.stack)}</span>`);
}

function printStackTrace(error: Error) {
    const errorMessage = escape(getSourceMapStackTrace(error));
    console.log(`<span style="color: tomato">${errorMessage}</span>`);
    Game.notify(errorMessage);
}

function stripWebpackFromStackTrace(text: string): string {
    return text.replace('webpack:///', '');
}