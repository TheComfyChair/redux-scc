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
import isObject from 'lodash/isObject';
import omit from 'lodash/omit';
import merge from 'lodash/fp/merge';
import { validateShape } from '../validatePayload';
import { createReducerBehaviors } from '../reducers';
import { PROP_TYPES } from '../structure';
import {
  isBatchAction,
  getApplicableBatchActions
} from './batchUpdates';

const reduce = require('lodash/fp/reduce').convert({ cap: false });

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
    const uniqueId = Math.random().toString(36).substring(5);
    return {
        reducers: {
            [name]: createReducer(reducerShape, createReducerBehaviors(DEFAULT_SHAPE_BEHAVIORS, `${uniqueId}-${locationString}`)),
        },
        actions: createActions(DEFAULT_SHAPE_BEHAVIORS, `${uniqueId}-${locationString}`),
    };
}


export function calculateDefaults(reducerStructure: any) {
    return reduce((memo, propValue, propName) => ({
        ...memo,
        [propName]: propValue().type === PROP_TYPES._shape
            ? calculateDefaults(propValue().structure)
            : propValue().defaultValue,
    }), {})(omit(reducerStructure, ['_wildcardKey']));
}


export function createReducer(objectStructure: StructureType, behaviors: ShapeReducerBehaviors): ShapeReducer {
    const initialState: Object = validateShape(objectStructure, calculateDefaults(objectStructure().structure));
    return (state = initialState, { type, payload }: ShapeReducerAction) => {
        //If the action type does not match any of the specified behaviors, just return the current state.
        const matchedBehaviors = behaviors[type]
          ? [{ type, payload }]
          : isBatchAction(type)
            ? getApplicableBatchActions(behaviors)(payload)
            : [];

        if (matchedBehaviors.length) {
            //Sanitize the payload using the reducer shape, then apply the sanitized
            //payload to the state using the behavior linked to this action type.
            return reduce((interimState, matchedBehavior) => merge(
                interimState,
                behaviors[matchedBehavior.type].reducer(
                  interimState,
                  behaviors[matchedBehavior.type].validate
                      ? validateShape(objectStructure, matchedBehavior.payload)
                      : matchedBehavior.payload,
                  initialState
                )
            ), state)(matchedBehaviors);
        }

        return state;
    }
}


function createActions(behaviorsConfig: ShapeReducerBehaviorsConfig, locationString: string): ShapeActions {
    //Take a reducer behavior config object, and create actions using the location string
    return reduce((memo, behavior, name) => ({
        ...memo,
        [name]: (payload: Object) => ({
            type: `${locationString}.${name}`,
            payload: (behavior.action || (payload => payload))(payload),
        })
    }), {})(behaviorsConfig);
}


