//@flow
//==============================
// Flow imports
//==============================
import type {
    StructureType,
    PrimitiveType,
} from './structure';

//==============================
// Flow types
//==============================
export type PartialReducer = {
    reducers: { [key: string]: any },
    actions: { [key: string]: any },
    selectors: { [key: string]: any },
};

export type Selector = (state: Object) => any;

//==============================
// JS imports
//==============================
import {
    PROP_TYPES,
} from './structure';
import { compose } from 'ramda';
import { reduce } from 'lodash';
import { createObjectReducer } from './reducers/objectReducer';
import { createArrayReducer } from './reducers/arrayReducer';
import { createPrimitiveReducer } from './reducers/primitiveReducer';

function determineReducerType(reducerDescriptor, {
    name,
    locationString,
}) {
    const REDUCERS = {
        [PROP_TYPES._shape]: createObjectReducer,
        [PROP_TYPES._array]: createArrayReducer,
        [PROP_TYPES._boolean]: createPrimitiveReducer,
        [PROP_TYPES._string]: createPrimitiveReducer,
        [PROP_TYPES._number]: createPrimitiveReducer,
    };
    const { structure } = reducerDescriptor();
    const { type } = structure();

    return {
        name,
        reducerFn: REDUCERS[type],
        reducerStructureDescriptor: structure,
        locationString,
    };
}

function callReducer({ name, reducerFn, reducerStructureDescriptor, locationString } = {}) {
    return reducerFn(reducerStructureDescriptor, {
        locationString,
        name,
    });
}

export function createReducerBehaviors(behaviorsConfig: any, locationString: string): any {
    //Take a reducer behavior config object, and create the reducer behaviors using the location string.
    //This is necessary since all action types are effectively global when Redux processes an action
    //(i.e. every reducer will be ran using the action object). Therefore we need to ensure that all
    //actions only result in the specific reducer performing a change. Actions are also generated using
    //the location string/name combination, so will match up 1:1.
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [`${locationString}.${name}`]: behavior.reducer,
    }), {});
}

export function calculateDefaults(typeDescription: StructureType | PrimitiveType) {
    //Using the structure of a type, calculate the default for that type.
    //Types can take two forms; a 'StructureType' and a 'PrimitiveType'. The former
    //can (and usually does) contain nested type descriptions, so we need to recurse
    //through the definition until defaults are found, and build up the corresponding
    //structure.
    const { type, structure = {}, defaultValue = '' } = typeDescription();
    const complex = [PROP_TYPES._array, PROP_TYPES._shape].indexOf(type) > -1;

    if (!complex) return defaultValue;

    return reduce(structure, (memo, propValue, propName) => ({
        ...memo,
        [propName]: calculateDefaults(propValue),
    }), {});
}

export const createReducer = compose(callReducer, determineReducerType);
