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
    actionsObject: { [key: string]: any },
    selectorsObject?: { [key: string]: any },
};

import {
    PROP_TYPES,
} from './structure';
import { compose } from 'ramda';
import { reduce } from 'lodash';
import { createObjectReducer } from './reducers/objectReducer';
import { createArrayReducer } from './reducers/arrayReducer';


function determineReducerType(reducerDescriptor, {
    locationString,
}) {
    const REDUCERS = {
        [PROP_TYPES._shape]: createObjectReducer,
        [PROP_TYPES._array]: createArrayReducer,
        [PROP_TYPES._boolean]: () => {},
        [PROP_TYPES._string]: () => {},
        [PROP_TYPES._number]: () => {},
    };
    const { structure } = reducerDescriptor();
    const { type } = structure();

    return {
        reducerFn: REDUCERS[type],
        reducerStructureDescriptor: structure,
        locationString,
    };
}

function callReducer({ reducerFn, reducerStructureDescriptor, locationString } = {}) {
    return reducerFn(reducerStructureDescriptor, {
        locationString,
    });
}

export const createReducer = compose(callReducer, determineReducerType);

export function createReducerBehaviors(behaviorsConfig: any, locationString: string): any {
    //Take a reducer behavior config object, and create the reducer behaviors using the location string
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [`${locationString}.${name}`]: behavior.reducer,
    }), {});
}

export function calculateDefaults(typeDescription: StructureType | PrimitiveType) {
    const { type, structure = {}, defaultValue = '' } = typeDescription();
    const complex = [PROP_TYPES._array, PROP_TYPES._shape].indexOf(type) > -1;

    if (!complex) return defaultValue;

    return reduce(structure, (memo, propValue, propName) => ({
        ...memo,
        [propName]: calculateDefaults(propValue),
    }), {});
}
