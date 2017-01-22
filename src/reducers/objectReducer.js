//@flow
//==============================
// Flow imports
//==============================
import type { StructureType } from '../structure';


//==============================
// Flow types
//==============================
export type ShapeReducerAction = {
    type: string,
    payload: Object,
    validate: boolean,
};
export type ShapeReducer = (state: Object, action: ShapeReducerAction) => Object;
export type ShapeReducerBehavior = (state: {}, payload: Object | void, initialState: {}) => Object;
export type ShapeReducerBehaviorsConfig = {
    [key: string]: {
        action?: (value: Object) => Object,
        reducer: ShapeReducerBehavior,
    }
};
export type ShapeReducerBehaviors = {
    [key: string]: ShapeReducerBehavior,
};
export type ShapeAction = (value: Object) => { type: string, payload: Object };
export type ShapeActions = {
    [key: string]: ShapeAction
};
export type ShapeReducerOptions = {
    behaviorsConfig: ShapeReducerBehaviorsConfig,
    locationString: string,
    name: string,
};


//==============================
// JS imports
//==============================
import { reduce, isObject } from 'lodash';
import { validateShape } from '../validatePayload';
import { createReducerBehaviors } from '../reducers';
import { PROP_TYPES } from '../structure';


//==============================
// Shape behaviors
// ----------------
// Shapes differ from primitive reducers by allowing an update behavior, merging the
// payload and the previous state in a shallow way. This supplements the replace
// behavior, which still replaces the previous state with the payload.
//==============================
export const DEFAULT_SHAPE_BEHAVIORS: ShapeReducerBehaviorsConfig = {
    update: {
        reducer(state, payload) {
            if (!isObject(payload)) return state;
            return { ...state, ...payload };
        },
        validate: true,
    },
    reset: {
        reducer(state, payload, initialState) {
            return initialState;
        },
        validate: false,
    },
    replace: {
        reducer(state, payload) {
            if (!payload) return state;
            return payload;
        },
        validate: true,
    }
};


export function createShapeReducer(reducerShape: StructureType, {
    locationString,
    name,
}: ShapeReducerOptions) {
    return {
        reducers: {
            [name]: createReducer(reducerShape, createReducerBehaviors(DEFAULT_SHAPE_BEHAVIORS, locationString)),
        },
        actions: createActions(DEFAULT_SHAPE_BEHAVIORS, locationString),
    };
}


export function calculateDefaults(reducerStructure: any) {
    return reduce(reducerStructure, (memo, propValue, propName) => ({
        ...memo,
        [propName]: propValue().type === PROP_TYPES._shape
            ? calculateDefaults(propValue().structure)
            : propValue().defaultValue,
    }), {});
}


export function createReducer(objectStructure: StructureType, behaviors: ShapeReducerBehaviors): ShapeReducer {
    const initialState: Object = validateShape(objectStructure, calculateDefaults(objectStructure().structure));
    return (state = initialState, { type, payload }: ShapeReducerAction) => {
        //If the action type does not match any of the specified behaviors, just return the current state.
        if (!behaviors[type]) return state;

        //Sanitize the payload using the reducer shape, then apply the sanitized
        //payload to the state using the behavior linked to this action type.
        return behaviors[type].reducer(
          state,
          behaviors[type].validate ? validateShape(objectStructure, payload) : payload,
          initialState
        );
    }
}


function createActions(behaviorsConfig: ShapeReducerBehaviorsConfig, locationString: string): ShapeActions {
    //Take a reducer behavior config object, and create actions using the location string
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [name]: (payload: Object) => ({
            type: `${locationString}.${name}`,
            payload: (behavior.action || (payload => payload))(payload),
        })
    }), {});
}


