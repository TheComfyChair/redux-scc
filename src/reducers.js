//@flow
//==============================
// Flow imports
//==============================
import type {
    StructureType,
    PrimitiveType,
    ReducerType,
    PropTypeKeys,
} from './structure';

//==============================
// Flow types
//==============================
export type PartialStoreChunk = {
    reducers: { [key: string]: any },
    actions: { [key: string]: any },
    selectors: { [key: string]: any },
    locationString: string,
    baseSelector: () => {},
    name: string,
};

export type Selector = (state: Object) => any;

type CallReducerInterface = {
    name: string,
    reducerFn: () => {},
    reducerStructureDescriptor: StructureType | PrimitiveType,
    locationString: string,
};

//==============================
// JS imports
//==============================
import {
    PROP_TYPES,
} from './structure';
import reduce from 'lodash/reduce';
import flowRight from 'lodash/fp/flowRight';
import { createShapeReducer } from './reducers/objectReducer';
import { createArrayReducer } from './reducers/arrayReducer';
import { createPrimitiveReducer } from './reducers/primitiveReducer';

export const REDUCER_CREATOR_MAPPING: { [key: PropTypeKeys]: any } = {
    [PROP_TYPES._shape]: createShapeReducer,
    [PROP_TYPES._array]: createArrayReducer,
    [PROP_TYPES._boolean]: createPrimitiveReducer,
    [PROP_TYPES._string]: createPrimitiveReducer,
    [PROP_TYPES._number]: createPrimitiveReducer,
    [PROP_TYPES._any]: createPrimitiveReducer,
};


export const createUniqueString = Math.random().toString(36).substring(7);


export function determineReducerType(reducerDescriptor: ReducerType, {
    name,
    locationString,
    reducerCreatorMapping = REDUCER_CREATOR_MAPPING,
}: {
    name: string,
    locationString: string,
    reducerCreatorMapping: { [key: PropTypeKeys]: any },
}): CallReducerInterface {

    const { structure } = reducerDescriptor();
    const { type } = structure();

    if (!reducerCreatorMapping[type]) throw new Error(`Reducer type ${type} does not have a corresponding createReducer function`);

    return {
        name,
        reducerFn: reducerCreatorMapping[type],
        reducerStructureDescriptor: structure,
        locationString,
    };
}


export function callReducer({
    name,
    reducerFn,
    reducerStructureDescriptor,
    locationString
}: CallReducerInterface) {
    return reducerFn(reducerStructureDescriptor, {
        locationString,
        name,
    });
}


export function createReducerBehaviors(behaviorsConfig: { [key: string]: { reducer: () => {} } }, locationString: string): any {
    //Take a reducer behavior config object, and create the reducer behaviors using the location string.
    //This is necessary since all action types are effectively global when Redux processes an action
    //(i.e. every reducer will be ran using the action object). Therefore we need to ensure that all
    //actions only result in the specific reducer performing a change. Actions are also generated using
    //the location string/name combination, so will match up 1:1.
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [`${locationString}.${name}`]: behavior,
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


export const createReducer = flowRight(callReducer, determineReducerType);
