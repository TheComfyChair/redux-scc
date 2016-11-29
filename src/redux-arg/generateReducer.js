//@flow
import type { ReducerStructure } from './structure';

import { combineReducers } from 'redux';
import { reduce, find } from 'lodash';
import { createReducer } from './reducers';
import { PROP_TYPES } from './constants';

export function buildReducers(structure: ReducerStructure) {

    const tmp = combineReducers(reduce(structure, (memo, propValue, propName) => {
        const { structure } = propValue();

        const containsReducers = !!find(structure, v => v().type === PROP_TYPES._reducer);

        const partial = {
            ...memo,
            [propName]: containsReducers ? buildReducers(structure) : createReducer(propValue),
        };

        return partial;
    }, {}));

    return tmp;
}





