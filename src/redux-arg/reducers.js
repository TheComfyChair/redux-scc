//@flow
import {
    PROP_TYPES,
} from './structure';
import { reduce } from 'lodash';
import { compose } from 'ramda';
import { primitiveReducer } from './reducers/primitiveReducer';
import { createObjectReducer } from './reducers/objectReducer';
import { arrayReducer } from './reducers/arrayReducer';

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
