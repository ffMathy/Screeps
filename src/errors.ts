export function handleErrorCodes<T extends number>(operation: () => T, switches?: Switches<T>): any {
    const result = operation().toString();
    if(switches && result in switches) {
        return switches[result]();
    } else {
        if(result === "0")
            return;
            
        throw new Error("Unexpected result: " + result);
    }
}

type Switches<T extends number> = {
    [P in T]?: () => any
}