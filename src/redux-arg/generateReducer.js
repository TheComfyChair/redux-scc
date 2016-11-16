//@flow
import { combineReducers } from 'redux';
import { reduce } from 'lodash';

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





