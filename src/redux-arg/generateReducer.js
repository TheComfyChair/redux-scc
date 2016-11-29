//@flow
import type { ShapeStructure } from './structure';

import { combineReducers } from 'redux';
import { reduce, find } from 'lodash';
import { createReducer } from './reducers';
import { PROP_TYPES } from './structure';

export function buildReducers(structure: ShapeStructure) {

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





