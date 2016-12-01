//@flow
//==============================
// Flow imports
//==============================
import type { ObjectReducer, ObjectAction, ObjectSelector } from './reducers/objectReducer';

import {
    PROP_TYPES,
} from './structure';
import { compose } from 'ramda';
import { createObjectReducer } from './reducers/objectReducer';

export type Selectors = ObjectSelector;
export type Actions = ObjectAction;
export type Reducers = ObjectReducer;
export type PartialReducer = {
    reducers: { [key: string]: Reducers},
    actionsObject: { [key: string]: Actions },
    selectorsObject?: { [key: string]: Selectors },
};

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
