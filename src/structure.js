//@flow

//==============================
// Flow types
//==============================
export type PropTypeKeys = $Keys<typeof PROP_TYPES>;

export type ShapeStructure = {
    [key: string]: StructureType | PrimitiveType | ArrayStructureType,
}
export type StructureType = () => {
    type: PropTypeKeys,
    structure: ShapeStructure | StructureType | PrimitiveType,
    defaultValue?: any,
};
export type ReducerType = () => {
    type: PropTypeKeys,
    structure: StructureType | PrimitiveType,
};
export type ArrayStructureType = () => {
    type: PropTypeKeys,
    structure: StructureType | PrimitiveType,
    defaultValue: any,
}
export type PrimitiveType = () => {
    type: PropTypeKeys,
    defaultValue?: any,
    typeofValue: string,
    structure?: PrimitiveType,
};
export type TypesObject = {
    [key: string]: CreateArrayType | CreateStringType | CreateNumberType | CreateShapeType | CreateBooleanType;
}

export type TypesObjectDefaults = {
    [key: string]: mixed | TypesArrayDefaults,
}
export type TypesArrayDefaults = Array<mixed> | Array<TypesObjectDefaults>;

type CreateStringType = (defaultValue: string) => PrimitiveType;
type CreateNumberType = (defaultValue: number) => PrimitiveType;
type CreateBooleanType = (defaultValue: boolean) => PrimitiveType;
type CreateArrayType = (structure: StructureType | PrimitiveType, defaultValue: TypesArrayDefaults | TypesObjectDefaults) => StructureType;
type CreateShapeType = (structure: ShapeStructure, defaultValue: TypesArrayDefaults | TypesObjectDefaults) => StructureType;

//==============================
// Structure
//==============================
export const PROP_TYPES = {
    _string: '_string',
    _number: '_number',
    _boolean: '_boolean',
    _reducer: '_reducer',
    _shape: '_shape',
    _array: '_array',
};

//The types objects are used in order to build up the structure of a store chunk, and provide/accept
//default values whilst doing so.
export const Types: TypesObject = {
    string: (defaultValue: string = '') => () => ({
        type: PROP_TYPES._string,
        defaultValue,
        typeofValue: 'string',
    }),
    number: (defaultValue: number = 0) => () => ({
        type: PROP_TYPES._number,
        defaultValue,
        typeofValue: 'number',
    }),
    boolean: (defaultValue: boolean = false) => () => ({
        type: PROP_TYPES._boolean,
        defaultValue,
        typeofValue: 'boolean',
    }),
    arrayOf: (structure: StructureType | PrimitiveType, defaultValue = []) => () => ({
        type: PROP_TYPES._array,
        structure,
        defaultValue,
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
