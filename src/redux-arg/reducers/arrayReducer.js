//@flow
//==============================
// Flow imports
//==============================
import type { ShapeStructure, StructureType } from '../structure';

//==============================
// Flow types
//==============================
export type ArrayReducerAction = {
    type: string,
    payload: any,
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
import { reduce, isArray, isObject, isNull } from 'lodash';
import { validateArray } from '../validatePayload';
import { createReducerBehaviors } from '../reducers';
import { updateAtIndex, removeAtIndex } from '../utils/arrayUtils';

function checkIndex(state: Object, payload: any, behaviorName: string): boolean {
    if (!isNumber(index)) {
        throw new Error(`Index not passed to ${behaviorName} for payload ${payload}.`);
    }
    return true;
}

const DEFAULT_ARRAY_BEHAVIORS: ArrayReducerBehaviorsConfig = {
    updateAtIndex: {
        action(value) { return value },
        reducer(state, payload, initialState, index) {
            checkIndex(index, payload, 'updateOne');
            if (isArray(payload) || isObject(payload)) return updateAtIndex(state, { ...state[index], ...payload }, index);
            return updateAtIndex(state, payload, index);
        }
    },
    resetAtIndex: {
        reducer(state, payload, initialState, index) {
            checkIndex(index, payload, 'updateOne');
            return updateAtIndex(state, initialState, index);
        }
    },
    removeAtIndex: {
        reducer(state, payload, initialState, index) {
            checkIndex(index, payload, 'updateOne');
            return removeAtIndex(state, index);
        }
    },
    replaceAtIndex: {
        reducer(state, payload, initialState, index) {
            checkIndex(index, payload, 'updateOne');
            return updateAtIndex(state, payload, index);
        }
    },
    replace: {
        action(value) {
            if(!isArray(value)) throw new Error('An array must be provided when replacing an array');
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

//TODO: All the array functionality!

export function createArrayReducer(reducerShape: StructureType, {
    locationString
}: ArrayReducerOptions = {}) {
    return {
        reducers: createReducer(reducerShape, createReducerBehaviors(DEFAULT_ARRAY_BEHAVIORS, locationString)),
        actionsObject: createActions(DEFAULT_ARRAY_BEHAVIORS, locationString, {}),
    };
}





function createReducer(arrayTypeDescription: StructureType, behaviors: ArrayReducerBehaviors): ArrayReducer {
    const initialState = calculateDefaults(arrayTypeDescription);
    return (state = initialState, { type, payload }: ArrayReducerAction) => {
        //If the action type does not match any of the specified behaviors, just return the current state.
        if (!behaviors[type]) return state;

        //Sanitize the payload using the reducer shape, then apply the sanitized
        //payload to the state using the behavior linked to this action type.
        return behaviors[type](state, validateArray(arrayTypeDescription, payload), initialState);
    }
}


function createActions(behaviorsConfig: ArrayReducerBehaviorsConfig, locationString: string, defaultPayload: any): ArrayActions {
    //Take a reducer behavior config object, and create actions using the location string
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [name]: (value: Object) => ({
            type: `${locationString}.${name}`,
            payload: (behavior.action || (() => defaultPayload))(value) || {}
        })
    }), {});
}
