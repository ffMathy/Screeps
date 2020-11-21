export function handleErrorCodes<T extends number>(operation: () => T, switches?: Switches<T>) {
    const result = operation().toString();
    if(result === "0")
        return;

    if(switches && result in switches) {
        switches[result]();
    } else {
        throw new Error("Unexpected result: " + result);
    }
}

type Switches<T extends number> = {
    [P in `${T}`]?: () => void
}