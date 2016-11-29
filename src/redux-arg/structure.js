//@flow

//==============================
// Flow types
//==============================
export type ShapeStructure = {
    [key: string]: StructureType|PrimitiveType,
}
export type StructureType = () => {
    type: string,
    structure: ShapeStructure|StructureType|PrimitiveType
};
export type PrimitiveType = () => {
    type: string,
    defaultValue?: any,
    typeofValue: string,
};
export type TypesObject = {
    [key: string]: CreateArrayType|CreateStringType|CreateNumberType|CreateObjectType;
}

export type TypesObjectDefaults = {
    [key: string]: mixed|TypesArrayDefaults,
}
export type TypesArrayDefaults = Array<mixed>|Array<TypesObjectDefaults>;

type CreateStringType = (defaultValue: string) => PrimitiveType;
type CreateNumberType = (defaultValue: number) => PrimitiveType;
type CreateArrayType = (structure: StructureType|PrimitiveType, defaultValue: TypesArrayDefaults|TypesObjectDefaults) => StructureType;
type CreateObjectType = (structure: ShapeStructure, defaultValue: TypesArrayDefaults|TypesObjectDefaults) => StructureType;

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
    string: (defaultValue: string = '') => () => ({
        type: PROP_TYPES._string,
        defaultValue,
        typeofValue: 'string'
    }),
    number: (defaultValue: number = 0) => () => ({
        type: PROP_TYPES._number,
        defaultValue,
        typeofValue: 'number'
    }),
    arrayOf: (structure: StructureType|PrimitiveType) => () => ({
        type: PROP_TYPES._array,
        structure,
    }),
    reducer: (structure: ShapeStructure) => () => ({
        type: PROP_TYPES._reducer,
        structure,
    }),
    shape: (structure: ShapeStructure) => () => ({
        type: PROP_TYPES._shape,
        structure,
    }),
};
