/**
 * Split a given array into two arrays - one filled with any elements that meet the
 *  criteria expressed by the given predicateFunction, and the other filled with those
 * that don't */
export function partition<T>(
    arr: T[],
    predicateFunction: (arg: T) => boolean
): [T[], T[]] {
    const a: T[] = [];
    const b: T[] = [];
    for (const el of arr) {
        if (predicateFunction(el)) {
            a.push(el);
        } else {
            b.push(el);
        }
    }
    return [a, b];
}

/**
 * Create, collect, and return an array of items,
 * by repeatedly calling the given creator function.
 *
 */
export function collect<T>(
    numToCreate: number,
    creatorFunction: (optionalNum?: number) => T
): T[] {
    const outputArray: T[] = [];
    for (let i = 0; i < numToCreate; i++) {
        const nextItem = creatorFunction(i);
        outputArray.push(nextItem);
    }
    return outputArray;
}

/** Calls the given function a given number of times, discarding any return from the function.
 *
 * If you want to keep the return values, see `collect`
 */
export function repeat<T>(
    numRepeats: number,
    callbackFunction: (optionalNum?: number) => void
): void {
    for (let i = 0; i < numRepeats; i++) {
        callbackFunction(i);
    }
}
