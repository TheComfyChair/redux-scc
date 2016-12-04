//@flow
//==============================
// Flow imports
//==============================
import type { StructureType } from '../structure';

//==============================
// Flow types
//==============================
export type ArrayReducerAction = {
    type: string,
    payload: any,
    index: number,
};
export type ArrayReducer = (state: Array<any>, action: ArrayReducerAction) => Array<any>;
export type ArrayReducerBehavior = (state: Array<any>, payload: any, initialState: Array<any>, index: number | void) => Array<any>;
export type ArrayReducerBehaviorsConfig = {
    [key: string]: {
        action?: (value: any) => any,
        reducer: ArrayReducerBehavior,
    }
};
export type ArrayReducerBehaviors = {
    [key: string]: ArrayReducerBehavior,
};
export type ArrayAction = (value: Array<any>) => { type: string, payload: any, index?: number };
export type ArrayActions = {
    [key: string]: Array<any>
};
export type ArrayReducerOptions = {
    behaviorsConfig: ArrayReducerBehaviorsConfig,
    locationString: string,
};
export type ArraySelector = (state: Object) => Array<any>;

//==============================
// JS imports
//==============================
import { reduce, isArray, isNumber, isObject } from 'lodash';
//import { validateArray } from '../validatePayload';
import { createReducerBehaviors } from '../reducers';
import { updateAtIndex, removeAtIndex } from '../utils/arrayUtils';

function checkIndex(index: ?number, payload: any, behaviorName: string): boolean {
    if (!isNumber(index) || index === -1) {
        throw new Error(`Index not passed to ${behaviorName} for payload ${payload}.`);
    }
    return true;
}

const DEFAULT_ARRAY_BEHAVIORS: ArrayReducerBehaviorsConfig = {
    updateAtIndex: {
        reducer(state, payload, initialState, index = -1) {
            checkIndex(index, payload, 'updateAtIndex');
            if (isArray(payload) || isObject(payload)) return updateAtIndex(state, { ...state[index], ...payload }, index);
            return updateAtIndex(state, payload, index);
        }
    },
    resetAtIndex: {
        reducer(state, payload, initialState, index) {
            checkIndex(index, payload, 'resetAtIndex');
            return updateAtIndex(state, initialState, index);
        }
    },
    removeAtIndex: {
        reducer(state, payload, initialState, index) {
            checkIndex(index, payload, 'removeAtIndex');
            return removeAtIndex(state, index);
        }
    },
    replaceAtIndex: {
        reducer(state, payload, initialState, index) {
            checkIndex(index, payload, 'replaceAtIndex');
            return updateAtIndex(state, payload, index);
        }
    },
    replace: {
        action(value) {
            if(!isArray(value)) throw new Error('An array must be provided when replacing an array');
            return value;
        },
        reducer(state, payload) {
            return payload;
        }
    },
    reset: {
        reducer(state, payload, initialState) {
            return initialState;
        }
    },
};

export function createArrayReducer(reducerShape: StructureType, {
    locationString
}: ArrayReducerOptions = {}) {
    return {
        reducers: createReducer(reducerShape, createReducerBehaviors(DEFAULT_ARRAY_BEHAVIORS, locationString)),
        actionsObject: createActions(DEFAULT_ARRAY_BEHAVIORS, locationString, {}),
    };
}

function createReducer(arrayTypeDescription: StructureType, behaviors: ArrayReducerBehaviors): ArrayReducer {
    return (state: Array<any> = [], { type, payload, index }: ArrayReducerAction) => {
        //If the action type does not match any of the specified behaviors, just return the current state.
        if (!behaviors[type]) return state;
        //Sanitize the payload using the reducer shape, then apply the sanitized
        //payload to the state using the behavior linked to this action type.
        return behaviors[type](state, payload, [], index);
    }
}


function createActions(behaviorsConfig: ArrayReducerBehaviorsConfig, locationString: string): ArrayActions {
    //Take a reducer behavior config object, and create actions using the location string
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [name]: (value: Array<any>, index: ?number) => ({
            type: `${locationString}.${name}`,
            payload: (behavior.action || (() => value))(value) || [],
            index,
        })
    }), {});
}
