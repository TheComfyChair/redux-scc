//@flow
//==============================
// Flow imports and types
//==============================
import type { PrimitiveType, StructureType, ShapeStructure } from './structure';

type validationFunction = (structure: StructureType | PrimitiveType | ShapeStructure, value: any) => any;

//==============================
// JS imports
//==============================
import reduce from 'lodash/reduce';
import isObject from 'lodash/isObject';
import { PROP_TYPES } from './structure';
const find = require('lodash/fp/find').convert({ cap: false });


export const hasWildcardKey = (objectStructure: any) =>
    !!find((prop, key) => key === PROP_TYPES._wildcardKey)(objectStructure().structure);


export const getValueType = (objectStructure: any, key: string, wildcardKeyPresent: boolean) =>
    wildcardKeyPresent
      ? objectStructure().structure[key] || objectStructure().structure[PROP_TYPES._wildcardKey]
      : objectStructure().structure[key];


export function validateShape(objectStructure: any, value: mixed): Object {
    if (!isObject(value)) {
        console.error(`The value passed to validateObject() was not an object. Value: `, value);
        return {};
    }

    const wildcardKeyPresent = hasWildcardKey(objectStructure);

    return reduce(value, (memo, value, name) => {
        const valueType = getValueType(objectStructure, name, wildcardKeyPresent);
        //If the value type does not exist in the reducer structure, and there's no wildcard key, then
        //we don't want to include it in the payload.
        //Display a console error for the developer, and skip the inclusion of this property in the payload.
        if (!valueType) {
            console.warn(`The property, ${name}, was not specified in the structure` +
                ` and was stripped out of the payload. Structure: ${ objectStructure().structure }`);
            return memo;
        }

        const validatedValue = getTypeValidation(valueType().type)(valueType, value);

        if (validatedValue === undefined) {
            console.warn(`The property, ${name}, was populated with a type ${ typeof value } which does not` +
                ` match that specified in the reducer configuration ${ wildcardKeyPresent ? ', nor did it match a wildcardKey': ''}. It has been stripped from` +
                ' the payload');
            return memo;
        }

        return {
            ...memo,
            [name]: validatedValue,
        }
    }, {});
}


export function validateValue(primitive: any, value: any): mixed {
    const evaluatedPrimitive = primitive();
    //If this value is a custom value, then we should apply it's custom validator!
    if (evaluatedPrimitive.type === PROP_TYPES._custom) {
        if (evaluatedPrimitive.validator(value)) return value;
        return console.warn(evaluatedPrimitive.validationErrorMessage(value));
    }

    //Otherwise we will use the standard, basic, typeof checks.
    if (typeof value === evaluatedPrimitive.typeofValue || evaluatedPrimitive.typeofValue === 'any') return value;
    return console.warn(`The value, ${value}, did not match the type specified (${evaluatedPrimitive.type}).`);
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
        [PROP_TYPES._string]: validateValue,
        [PROP_TYPES._number]: validateValue,
        [PROP_TYPES._boolean]: validateValue,
        [PROP_TYPES._array]: validateArray,
        [PROP_TYPES._shape]: validateShape,
        [PROP_TYPES._any]: validateValue,
        [PROP_TYPES._custom]: validateValue,
    };
    const typeValidation = TYPE_VALIDATIONS[type];
    if (!typeValidation) {
        throw new Error(`The type ${type} does not have a corresponding
                validation function!`);
    }
    return typeValidation;
}