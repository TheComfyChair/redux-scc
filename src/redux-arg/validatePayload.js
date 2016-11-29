//@flow
//==============================
// Flow imports
//==============================
import type { PrimitiveType, StructureType, ShapeStructure } from './structure';

type validationFunction = (structure: StructureType|PrimitiveType|ShapeStructure, value: any) => any;

//==============================
// JS imports
//==============================
import { reduce } from 'lodash/reduce';
import { isObject } from 'lodash/isObject';
import { PROP_TYPES } from './structure';

export function validateObject(objectStructure: any, value: mixed): Object {
    if (!isObject(value)) {
        console.error(`The value passed to validateObject() was not an object. Value: `, value);
        return {};
    }
    return reduce(value, (memo, value, name) => {
        const valueType = objectStructure.structure[name];
        //If the value type does not exist in the reducer structure, we don't want to include it in the payload.
        //Display a console error for the developer, and skip the inclusion of this property in the payload.
        if (!valueType) {
            console.error(`The property, ${name}, was not specified in the structure
                and was stripped out of the payload. Structure:`, objectStructure);
            return memo;
        }

        return {
            ...memo,
            [name]: getTypeValidation(valueType().type)(valueType, value),
        }
    }, {});
}

export function validatePrimitive(primitive: any, value: mixed): mixed {
    //Validate primitives using the typeofValue property of the primitive type definitions.
    return typeof value === primitive().typeofValue ? value : undefined;
}

export function validateArray(arrayStructure: any, value: Array<mixed>): Array<mixed> {
    //Validate arrays by performing either of the other validation types to each element of the array,
    //based on the provided reducer structure.
    const elementStructure = arrayStructure().structure;
    const elementType = arrayStructure().type;
    return value.map(v => getTypeValidation(elementType)(elementStructure, value))
}

function getTypeValidation(type): validationFunction {
    const TYPE_VALIDATIONS = new Map([
        [[PROP_TYPES._string], validatePrimitive],
        [[PROP_TYPES._number], validatePrimitive],
        [[PROP_TYPES._array], validateArray],
        [[PROP_TYPES._shape], validateObject],
    ]);
    const typeValidation = TYPE_VALIDATIONS.get(type);
    if (!typeValidation) {
        throw new Error(`The type ${type} does not have a corresponding
                validation function!`);
    }
    return typeValidation;
}