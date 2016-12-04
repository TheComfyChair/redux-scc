//@flow

//==============================
// Flow types
//==============================
export type ShapeStructure = {
    [key: string]: StructureType | PrimitiveType,
}
export type StructureType = () => {
    type: string,
    structure: ShapeStructure | StructureType | PrimitiveType
};
export type PrimitiveType = () => {
    type: $Keys<typeof PROP_TYPES>,
    defaultValue?: any,
    typeofValue: string,
    structure?: PrimitiveType,
};
export type TypesObject = {
    [key: string]: CreateArrayType | CreateStringType | CreateNumberType | CreateObjectType | CreateBooleanType;
}

export type TypesObjectDefaults = {
    [key: string]: mixed | TypesArrayDefaults,
}
export type TypesArrayDefaults = Array<mixed> | Array<TypesObjectDefaults>;

type CreateStringType = (defaultValue: string) => PrimitiveType;
type CreateNumberType = (defaultValue: number) => PrimitiveType;
type CreateBooleanType = (defaultValue: boolean) => PrimitiveType;
type CreateArrayType = (structure: StructureType | PrimitiveType, defaultValue: TypesArrayDefaults | TypesObjectDefaults) => StructureType;
type CreateObjectType = (structure: ShapeStructure, defaultValue: TypesArrayDefaults | TypesObjectDefaults) => StructureType;

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
    arrayOf: (structure: StructureType | PrimitiveType) => () => ({
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
    })
};
