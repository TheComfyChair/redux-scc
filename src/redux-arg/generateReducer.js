//@flow
import { combineReducers } from 'redux';
import { reduce, find } from 'lodash';

export function generateReducer(reducerMap: Object): (Object) => Object {
    return combineReducers(reduce(reducerMap, (memo, propValue, propName) => ({
        ...memo,
        [propName]: objectReducer(propValue),
    }), reducerMap));
}

function objectReducer(initialState: Object): (Object) => (Object, Object) => Object {
    return (state = initialState, { type } = {} ) => {
        switch(type) {
            case 'BLARG!':
                return state;
            default:
                return state;
        }
    }
}

const PROP_TYPES = new Map([
    ['_string', Symbol()],
    ['_number', Symbol()],
    ['_reducer', Symbol()],
    ['_shape', Symbol()],
    ['_array', Symbol()],
]);

const TYPE_DEFAULTS = new Map([
    [PROP_TYPES._string, ''],
    [PROP_TYPES._number, 0],
]);

export const Types = {
    string: () => ({ type: PROP_TYPES.get('_string') }),
    number: () => ({ type: PROP_TYPES.get('_number') }),
    reducer: structure => () => ({ type: PROP_TYPES.get('_reducer'), structure }),
};


export function buildReducers(structure) {

    const tmp = combineReducers(reduce(structure, (memo, propValue, propName) => {
        const { structure } = propValue();


        const containsReducers = !!find(structure, v => v().type === PROP_TYPES.get('_reducer'));

        console.log(111, propValue(), propName, containsReducers, structure);

        const partial = {
            ...memo,
            [propName]: containsReducers ? buildReducers(structure) : objectReducer(assignDefaults(structure)),
        };

        return partial;
    }, {}));

    return tmp;
}

function assignDefaults(structure) {

    console.log(222, structure);

    const tmp2 = reduce(structure, (memo, propValue, propName) => ({
        ...memo,
        [propName]: TYPE_DEFAULTS.get(propValue().type)
    }), {});

    console.log(333, tmp2);

    return tmp2;
}






