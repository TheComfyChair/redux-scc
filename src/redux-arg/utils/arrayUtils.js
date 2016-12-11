//@flow
export function updateAtIndex(array: Array<any>, value: any, index: number): Array<any> {
    if (typeof index !== 'number') throw new Error('Must provide a numeric index to updateAtIndex');
    if (index < 0 || index > array.length - 1) throw new Error(`The index ${index} is out of range for the array provided`);
    return [
        ...array.slice(0,index),
        value,
        ...array.slice(index + 1),
    ];
}

export function removeAtIndex(array: Array<any>, index: number): Array<any> {
    if (typeof index !== 'number') throw new Error('Must provide a numeric index to removeAtIndex');
    if (index < 0 || index > array.length - 1) throw new Error(`The index ${index} is out of range for the array provided`);
    return [
        ...array.slice(0, index),
        ...array.slice(index + 1),
    ];
}
