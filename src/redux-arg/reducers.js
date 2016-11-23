//@flow
import {
    PROP_TYPES,
    TYPE_DEFAULTS,
} from './constants';
import {
    reduce
} from 'lodash';
import {
    compose
} from 'ramda';

type ObjectReducerAction = {
    type: string,
    payload?: Object,
};
type ObjectReducer = (Object) => (Object, ObjectReducerAction) => Object;

type Primitive = string | number;
type PrimitiveReducerAction = {
    type: string,
    payload?: string | number,
};
type PrimitiveReducer = (Primitive) => (Primitive, PrimitiveReducerAction) => Primitive;

type ArrayReducerAction = {
    type: string,
    payload?: Array,
    index?: number,
};
type ArrayReducer = (Array) => (Array, ArrayReducerAction) => Array;

const REDUCER_FUNCTIONS = {
    objectReducer(reducerStructureDescriptor): ObjectReducer {
        const { structure } = reducerStructureDescriptor();
        return (state = determineDefaults(reducerStructureDescriptor)(structure), { type, payload } = {}) => {
            switch (type) {
                case 'BLARG!':
                    return { state, ...reducerStructureDescriptor, ...payload };
                default:
                    return state;
            }
        }
    },
    primitiveReducer(reducerStructureDescriptor): PrimitiveReducer {
        const { structure } = reducerStructureDescriptor();
        return (state = determineDefaults(reducerStructureDescriptor)(structure), { type, payload } = {}) => {
            switch(type) {
                case 'BLARG2':
                    return { state, ...structure, ...payload };
                default:
                    return state;
            }
        }
    },
    arrayReducer(reducerStructureDescriptor): ArrayReducer {
        return (state = [], { type, payload } = {}) => {
            switch(type) {
                case 'BLARG3':
                    return { state, ...reducerStructureDescriptor, ...payload };
                default:
                    return state;
            }
        }
    }
};

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

    let reducerFn = REDUCER_FUNCTIONS.primitiveReducer;
    if (type === PROP_TYPES._shape) reducerFn = REDUCER_FUNCTIONS.objectReducer;
    if (type === PROP_TYPES._array) reducerFn = REDUCER_FUNCTIONS.arrayReducer;
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
