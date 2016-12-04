//@flow
export function updateAtIndex(array: Array<any>, value: any, index: ?number): Array<any> {
    if (index === undefined || index === null) throw new Error('Must provide an index to updateAtIndex');
    return [
        ...array.slice(0,index),
        value,
        ...array.slice(index + 1),
    ];
}

export function removeAtIndex(array: Array<any>, index: ?number): Array<any> {
    if (index === undefined || index === null) throw new Error('Must provide an index to removeAtIndex');
    return [
        ...array.slice(0, index),
        ...array.slice(index + 1),
    ];
}
