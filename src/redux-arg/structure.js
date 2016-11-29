//@flow

//==============================
// Flow types
//==============================
export type ReducerStructure = {
    [key: string]: StructureType
}

export type StructureType = (structure: ?ReducerStructure) => {
    type: string,
    structure: [StructureType | ReducerStructure]
};

//==============================
// Structure
//==============================
export const PROP_TYPES = {
    _string: '_string',
    _number: '_number',
    _reducer: '_reducer',
    _shape: '_shape',
    _array: '_array',
};

export const TYPE_DEFAULTS = new Map([
    [PROP_TYPES._string, ''],
    [PROP_TYPES._number, 0],
]);

export const Types = {
    string: () => ({ type: PROP_TYPES._string, structure: PROP_TYPES._string }),
    number: () => ({ type: PROP_TYPES._number, structure: PROP_TYPES._number }),
    arrayOf: (structure: ReducerStructure) => () => ({ type: PROP_TYPES._array, structure }),
    reducer: (structure: ReducerStructure) => () => ({ type: PROP_TYPES._reducer, structure }),
    shape: (structure: ReducerStructure) => () => ({ type: PROP_TYPES._shape, structure}),
};
