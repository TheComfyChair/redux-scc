//@flow
//==============================
// Flow imports and types
//==============================
import type { PrimitiveType, StructureType, ShapeStructure } from './structure';

type validationFunction = (structure: StructureType | PrimitiveType | ShapeStructure, value: any) => any;

//==============================
// JS imports
//==============================
import { reduce, isObject } from 'lodash';
import { PROP_TYPES } from './structure';

export function validateShape(objectStructure: any, value: mixed): Object {
    if (!isObject(value)) {
        console.error(`The value passed to validateObject() was not an object. Value: `, value);
        return {};
    }

    return reduce(value, (memo, value, name) => {
        const valueType = objectStructure().structure[name];
        //If the value type does not exist in the reducer structure, we don't want to include it in the payload.
        //Display a console error for the developer, and skip the inclusion of this property in the payload.
        if (!valueType) {
            console.warn(`The property, ${name}, was not specified in the structure` +
                ' and was stripped out of the payload. Structure: ',  objectStructure().structure);
            return memo;
        }

        const validatedValue = getTypeValidation(valueType().type)(valueType, value);
        if (validatedValue === undefined) {
            console.warn(`The property, ${name}, was populated with a type ${ typeof value } which does not` +
                ' match that specified in the reducer configuration. It has been stripped from' +
                ' the payload');
            return memo;
        }

        return {
            ...memo,
            [name]: validatedValue,
        }
    }, {});
}


export function validatePrimitive(primitive: any, value: any): mixed {
    //Validate primitives using the typeofValue property of the primitive type definitions.
    if (typeof value === primitive().typeofValue ) return value;
    return console.warn(`The value, ${value}, did not match the type specified (${primitive().type}).`);
}


export function validateArray(arrayStructure: any, value: Array<any>): Array<mixed> {
    //Validate arrays by performing either of the other validation types to each element of the array,
    //based on the provided reducer structure.
    if (!Array.isArray(value)) {
        console.error(`The value passed to validateArray() was not an array. Value: `, value);
        return [];
    }
    const elementStructure = arrayStructure().structure;
    const elementType = elementStructure().type;
    return value.map(element => getTypeValidation(elementType)(elementStructure, element)).filter(e => e);
}


export function getTypeValidation(type: string): validationFunction {
    const TYPE_VALIDATIONS = {
        [PROP_TYPES._string]: validatePrimitive,
        [PROP_TYPES._number]: validatePrimitive,
        [PROP_TYPES._boolean]: validatePrimitive,
        [PROP_TYPES._array]: validateArray,
        [PROP_TYPES._shape]: validateShape,
    };
    const typeValidation = TYPE_VALIDATIONS[type];
    if (!typeValidation) {
        throw new Error(`The type ${type} does not have a corresponding
                validation function!`);
    }
    return typeValidation;
}