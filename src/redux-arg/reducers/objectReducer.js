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
export type ObjectReducerBehavior = (state: Object, payload: Object | void, initialState: Object) => Object;
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
export type ObjectSelector = (state: Object) => Object;

//==============================
// JS imports
//==============================
import { reduce } from 'lodash';
import { validateObject } from '../validatePayload';
import { createReducerBehaviors } from '../reducers';
import { PROP_TYPES } from '../structure';

const DEFAULT_OBJECT_BEHAVIORS: ObjectReducerBehaviorsConfig = {
    update: {
        action(value) { return value },
        reducer(state, payload = {}) {
            return { ...state, ...payload };
        }
    },
    reset: {
        reducer(state, payload, initialState) {
            return initialState;
        }
    },
    replace: {
        action(value) { return value },
        reducer(state, payload = {}) {
            return payload;
        }
    }
};

export function createObjectReducer(reducerShape: StructureType, {
    locationString
}: ObjectReducerOptions = {}) {
    return {
        reducers: createReducer(reducerShape, createReducerBehaviors(DEFAULT_OBJECT_BEHAVIORS, locationString)),
        actionsObject: createActions(DEFAULT_OBJECT_BEHAVIORS, locationString, {}),
    };
}


function calculateDefaults(reducerStructure) {
    return reduce(reducerStructure, (memo, propValue, propName) => ({
        ...memo,
        [propName]: propValue().type === PROP_TYPES._shape
            ? calculateDefaults(propValue().structure)
            : propValue().defaultValue,
    }), {});
}


function createReducer(objectStructure: StructureType, behaviors: ObjectReducerBehaviors): ObjectReducer {
    const initialState: Object = validateObject(objectStructure, calculateDefaults(objectStructure().structure));
    return (state = initialState, { type, payload }: ObjectReducerAction) => {
        //If the action type does not match any of the specified behaviors, just return the current state.
        if (!behaviors[type]) return state;

        //Sanitize the payload using the reducer shape, then apply the sanitized
        //payload to the state using the behavior linked to this action type.
        return behaviors[type](state, validateObject(objectStructure, payload), initialState);
    }
}


function createActions(behaviorsConfig: ObjectReducerBehaviorsConfig, locationString: string, defaultPayload: any): ObjectActions {
    //Take a reducer behavior config object, and create actions using the location string
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [name]: (value: Object) => ({
            type: `${locationString}.${name}`,
            payload: (behavior.action || (() => defaultPayload))(value) || {}
        })
    }), {});
}


