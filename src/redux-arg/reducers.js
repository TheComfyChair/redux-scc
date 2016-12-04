//@flow
//==============================
// Flow imports
//==============================
import type {
    ObjectReducer,
    ObjectAction,
    ObjectSelector,
    ObjectReducerBehaviorsConfig,
    ObjectReducerBehaviors,
} from './reducers/objectReducer';
import type {
    StructureType,
    PrimitiveType,
} from './structure';

//==============================
// Flow types
//==============================
export type Selectors = ObjectSelector;
export type Actions = ObjectAction;
export type Reducers = ObjectReducer;
export type PartialReducer = {
    reducers: { [key: string]: Reducers},
    actionsObject: { [key: string]: Actions },
    selectorsObject?: { [key: string]: Selectors },
};
type ReducerBehaviorsConfig = ObjectReducerBehaviorsConfig;
type ReducerBehaviors = ObjectReducerBehaviors;

import {
    PROP_TYPES,
} from './structure';
import { compose } from 'ramda';
import { reduce } from 'lodash';
import { createObjectReducer } from './reducers/objectReducer';


function determineReducerType(reducerDescriptor, {
    locationString,
}) {
    const { structure } = reducerDescriptor();
    const { type } = structure();

    let reducerFn = null;
    if (type === PROP_TYPES._shape) reducerFn = createObjectReducer;
    return {
        reducerFn,
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

export function createReducerBehaviors(behaviorsConfig: ReducerBehaviorsConfig, locationString: string): ReducerBehaviors {
    //Take a reducer behavior config object, and create the reducer behaviors using the location string
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [`${locationString}.${name}`]: behavior.reducer,
    }), {});
}

export function calculateDefaults(typeDescription: StructureType | PrimitiveType) {
    const { type, structure = {}} = typeDescription;
    if ([PROP_TYPES.array, PROP_TYPES.shape].find(type))
        return reduce(reducerStructure, (memo, propValue, propName) => ({
        ...memo,
        [propName]: propValue().defaultValue,
    }), {});
}
