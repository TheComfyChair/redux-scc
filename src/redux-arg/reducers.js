//@flow
//==============================
// Flow imports
//==============================
import type { ObjectReducer, ObjectAction, ObjectSelector } from './reducers/objectReducer';

import {
    PROP_TYPES,
} from './structure';
import { reduce } from 'lodash';
import { compose } from 'ramda';
import { primitiveReducer } from './reducers/primitiveReducer';
import { createObjectReducer } from './reducers/objectReducer';
import { arrayReducer } from './reducers/arrayReducer';

export type Selectors = ObjectSelector;
export type Actions = ObjectAction;
export type Reducers = ObjectReducer;
export type PartialReducer = {
    reducers: { [key: string]: Reducers},
    actionsObject: { [key: string]: Actions },
    selectorsObject?: { [key: string]: Selectors },
};

function determineReducerType(reducerDescriptor) {
    const { structure } = reducerDescriptor();
    const { type } = structure();

    let reducerFn = primitiveReducer;
    if (type === PROP_TYPES._shape) reducerFn = createObjectReducer;
    if (type === PROP_TYPES._array) reducerFn = arrayReducer;
    return {
        reducerFn,
        reducerStructureDescriptor: structure,
    };
}

function callReducer({ reducerFn, reducerStructureDescriptor } = {}) {
    return reducerFn(reducerStructureDescriptor);
}

export const createReducer = compose(callReducer, determineReducerType);
