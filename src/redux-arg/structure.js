//@flow

//==============================
// Flow types
//==============================
export type ReducerStructure = {
    [key: string]: StructureType|PrimitiveType,
}
export type StructureType = () => {
    type: string,
    structure: StructureType|ReducerStructure
};
export type PrimitiveType = () => {
    type: string,
    structure: $Keys<typeof PROP_TYPES>,
    defaultValue: ?any,
};

export type TypesObject = {
    [key: string]: CreateStructure|CreateStringType|CreateNumberType
}

export type TypesObjectDefaults = {
    [key: string]: mixed|TypesArrayDefaults,
}
export type TypesArrayDefaults = Array<mixed>|Array<TypesObjectDefaults>;

type CreateStringType = (defaultValue: string) => PrimitiveType;
type CreateNumberType = (defaultValue: number) => PrimitiveType;
type CreateStructure = (structure: ReducerStructure, defaultValue: TypesArrayDefaults|TypesObjectDefaults) => StructureType;

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

export const Types: TypesObject = {
    string: (defaultValue: string = '') => () => ({ type: PROP_TYPES._string, structure: PROP_TYPES._string, defaultValue }),
    number: (defaultValue: number = 0) => () => ({ type: PROP_TYPES._number, structure: PROP_TYPES._number, defaultValue }),
    arrayOf: (structure: ReducerStructure) => () => ({ type: PROP_TYPES._array, structure }),
    reducer: (structure: ReducerStructure) => () => ({ type: PROP_TYPES._reducer, structure }),
    shape: (structure: ReducerStructure) => () => ({ type: PROP_TYPES._shape, structure}),
};
