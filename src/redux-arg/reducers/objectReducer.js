//@flow
//==============================
// Flow imports
//==============================
import type { ShapeStructure, StructureType } from '../structure';

//==============================
// Flow types
//==============================
export type ObjectReducerAction = {
    type: string,
    payload: Object,
};
export type ObjectReducerFactory = (reducerStructure: ShapeStructure) => ObjectReducer;
export type ObjectReducer = (state: Object, action: ObjectReducerAction) => Object;
export type ObjectReducerBehavior = (state: Object, payload: Object, initialState: Object) => Object;
export type ObjectReducerBehaviorsConfig = {
    [key: string]: {
        action?: (value: Object) => Object,
        reducer: ObjectReducerBehavior,
    }
};
export type ObjectReducerBehaviors = {
    [key: string]: ObjectReducerBehavior,
};
export type ObjectAction = (value: Object) => { type: string, payload: Object };
export type ObjectActions = {
    [key: string]: ObjectAction
};
export type ObjectReducerOptions = {
    behaviorsConfig: ObjectReducerBehaviorsConfig,
    locationString: string,
};

//==============================
// JS imports
//==============================
import { reduce } from 'lodash/reduce';
import { validateObject } from '../validatePayload';

const DEFAULT_OBJECT_BEHAVIORS: ObjectReducerBehaviorsConfig = {
    update: {
        action(value) { return value },
        reducer(state, payload) {
            return { ...state, ...payload };
        }
    },
    reset: {
        reducer(state, payload, initialState) {
            return initialState;
        }
    },
    replace: {
        reducer(state, payload, initialState) {
            return payload;
        }
    }
};

export function createObjectReducer(reducerShape: StructureType, {
    behaviorsConfig = {},
    locationString
}: ObjectReducerOptions) {
    return {
        reducer: createReducer(reducerShape, createReducerBehaviors(behaviorsConfig, locationString)),
        actions: createActions(behaviorsConfig, locationString),
    };
}

function calculateDefaults(reducerStructure) {
    return reduce(reducerStructure, (memo, propValue, propName) => ({
        ...memo,
        [propName]: propValue().defaultValue,
    }), {});
}

function createReducer(objectStructure: StructureType, behaviors: ObjectReducerBehaviors): ObjectReducer {
    const initialState = calculateDefaults(objectStructure().structure);
    return (state = initialState, { type, payload }: ObjectReducerAction) => {
        //If the action type does not match any of the specified behaviors, just return the current state.
        if (!behaviors[type]) return state;
        //Sanitize the payload using the reducer shape, then
        //apply the sanitized payload to the state using the behavior linked to this action type.
        return behaviors[type](state, validateObject(payload), initialState);
    }
}

function createActions(behaviorsConfig: ObjectReducerBehaviorsConfig, locationString: string): ObjectActions {
    //Take a reducer behavior config object, and create actions using the location string
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [`${locationString}.${name}`]: (value: Object) =>
            ({ type: `${locationString}.${name}`, payload: behavior.action(value) || {} })
    }), {});
}

function createReducerBehaviors(behaviorsConfig: ObjectReducerBehaviorsConfig, locationString: string): ObjectReducerBehaviors {
    //Take a reducer behavior config object, and create the reducer behaviors using the location string
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [`${locationString}.${name}`]: behavior,
    }), {});
}

