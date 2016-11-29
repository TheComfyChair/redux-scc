//@flow
import {
    PROP_TYPES,
    TYPE_DEFAULTS,
} from './constants';
import { reduce } from 'lodash';
import { compose } from 'ramda';
import { primitiveReducer } from './reducers/primitiveReducer';
import { objectReducer } from './reducers/objectReducer';
import { arrayReducer } from './reducers/arrayReducer';

const DEFAULTS_FUNCTIONS = new Map([
    [PROP_TYPES._shape, objectDefaults],
    [PROP_TYPES._array, arrayDefaults],
    [PROP_TYPES._string, primitiveDefaults],
    [PROP_TYPES._number, primitiveDefaults],
]);

function objectDefaults(structure) {
    return reduce(structure, (memo, propValue, propName) => console.log(333, { propName, propValue: propValue() }) || ({
        ...memo,
        [propName]: TYPE_DEFAULTS.get(propValue().type)
    }), {});
}

function arrayDefaults() {
    return [];
}

function primitiveDefaults(structure) {
    return TYPE_DEFAULTS.get(structure);
}

function determineReducerType(reducerDescriptor) {
    const { structure } = reducerDescriptor();
    const { type } = structure();

    let reducerFn = primitiveReducer;
    if (type === PROP_TYPES._shape) reducerFn = objectReducer;
    if (type === PROP_TYPES._array) reducerFn = arrayReducer;
    return {
        reducerFn,
        reducerStructureDescriptor: structure,
    };
}

function callReducer({ reducerFn, reducerStructureDescriptor } = {}) {
    return reducerFn(reducerStructureDescriptor);
}

function determineDefaults(reducerStructureDescriptor) {
    const { type } = reducerStructureDescriptor();
    console.log(111, { type, fn: DEFAULTS_FUNCTIONS.get(type), DEFAULTS_FUNCTIONS });
    return DEFAULTS_FUNCTIONS.get(type);
}

export const createReducer = compose(callReducer, determineReducerType);
