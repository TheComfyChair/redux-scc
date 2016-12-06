//@flow
//==============================
// Flow imports
//==============================
import type { PrimitiveType } from '../structure';

//==============================
// Flow types
//==============================
export type PrimitiveReducerAction = {
    type: string,
    payload: mixed,
};
export type PrimitiveReducer = (state: mixed, action: PrimitiveReducerAction) => mixed;
export type PrimitiveReducerBehavior = (state: mixed, payload: mixed | void, initialState: mixed) => mixed;
export type PrimitiveReducerBehaviorsConfig = {
    [key: string]: {
        action?: (value: mixed) => mixed,
        reducer: PrimitiveReducerBehavior,
    }
};
export type PrimitiveReducerBehaviors = {
    [key: string]: PrimitiveReducerBehavior,
};
export type PrimitiveAction = (value: mixed) => { type: string, payload: mixed };
export type PrimitiveActions = {
    [key: string]: PrimitiveAction
};
export type PrimitiveReducerOptions = {
    behaviorsConfig: PrimitiveReducerBehaviorsConfig,
    locationString: string,
    name: string,
};

//==============================
// JS imports
//==============================
import { reduce } from 'lodash';
import { validatePrimitive } from '../validatePayload';
import { createReducerBehaviors } from '../reducers';

const DEFAULT_PRIMITIVE_BEHAVIORS: PrimitiveReducerBehaviorsConfig = {
    update: {
        action(value) { return value },
        reducer(state, payload) {
            if (payload === undefined) return state;
            return payload;
        }
    },
    reset: {
        reducer(state, payload, initialState) {
            return initialState;
        }
    },
};


export function createPrimitiveReducer(primitiveType: PrimitiveType, {
    locationString,
    name,
}: PrimitiveReducerOptions = {}) {
    return {
        reducers: {
            [name]: createReducer(primitiveType, createReducerBehaviors(DEFAULT_PRIMITIVE_BEHAVIORS, locationString)),
        },
        actions: createActions(DEFAULT_PRIMITIVE_BEHAVIORS, locationString, {}),
    };
}


function createReducer(primitiveType: PrimitiveType, behaviors: PrimitiveReducerBehaviors): PrimitiveReducer {
    const initialState: mixed = validatePrimitive(primitiveType, primitiveType().defaultValue);
    return (state = initialState, { type, payload }: PrimitiveReducerAction) => {
        //If the action type does not match any of the specified behaviors, just return the current state.
        if (!behaviors[type]) return state;

        //Sanitize the payload using the reducer shape, then apply the sanitized
        //payload to the state using the behavior linked to this action type.
        return behaviors[type](state, validatePrimitive(primitiveType, payload), initialState);
    }
}


function createActions(behaviorsConfig: PrimitiveReducerBehaviorsConfig, locationString: string, defaultPayload: any): PrimitiveActions {
    //Take a reducer behavior config object, and create actions using the location string
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [name]: (value: mixed) => ({
            type: `${locationString}.${name}`,
            payload: (behavior.action || (() => defaultPayload))(value),
        })
    }), {});
}



