//@flow
//==============================
// Flow imports
//==============================
import type { StructureType, ArrayStructureType } from '../structure';

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
import { validateArray, validateObject, validatePrimitive } from '../validatePayload';
import { createReducerBehaviors } from '../reducers';
import { updateAtIndex, removeAtIndex } from '../utils/arrayUtils';
import { PROP_TYPES } from '../structure';

function checkIndex(index: ?number, payload: any, behaviorName: string): boolean {
    if (!isNumber(index) || index === -1) {
        console.warn(`Index not passed to ${behaviorName} for payload ${payload}.`);
        return false;
    }
    return true;
}

const DEFAULT_ARRAY_BEHAVIORS: ArrayReducerBehaviorsConfig = {
    updateAtIndex: {
        reducer(state, payload, initialState, index = -1) {
            if (!checkIndex(index, payload, 'updateAtIndex')) return state;
            if (payload === undefined) return console.warn('Undefined was passed when updating index. Update not performed') || state;
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
            if (payload === undefined) console.warn('Undefined was passed when updating index. Update not performed');
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


export function createArrayReducer(arrayTypeDescription: ArrayStructureType, {
    locationString
}: ArrayReducerOptions = {}) {
    return {
        reducers: createReducer(arrayTypeDescription, createReducerBehaviors(DEFAULT_ARRAY_BEHAVIORS, locationString)),
        actionsObject: createActions(DEFAULT_ARRAY_BEHAVIORS, locationString, {}),
    };
}


function createReducer(arrayTypeDescription: ArrayStructureType, behaviors: ArrayReducerBehaviors): ArrayReducer {
    //Take the initial value specified as the default for the array, then apply it, using the validation
    //when doing so. The initial value must be an array.
    const initialValue = validateArray(arrayTypeDescription, arrayTypeDescription().defaultValue);

    //Return the array reducer.
    return (state: Array<any> = initialValue, { type, payload, index }: ArrayReducerAction) => {
        //If the action type does not match any of the specified behaviors, just return the current state.
        if (!behaviors[type]) return state;
        //Validating the payload of an array is more tricky, as we do not know ahead of time if the
        //payload should be an object, primitive, or an array. However, we can still validate here based on the
        //payload type passed.
        return behaviors[type](state, applyValidation(arrayTypeDescription, payload), initialValue, index);
    }
}


function applyValidation(arrayTypeDescription: ArrayStructureType, payload: any) {
    // Array validation is more tricky than object/primitive, as it is possible that the current
    // action may involve updating the contents of a specific array element, rather than the
    // whole array. As a result, some extra functionality is required to determine which
    // form of validation to apply.

    // First case is simple - if the action payload is an array, then we simply validate it against
    // the structure of this reducer.
    if (isArray(payload)) return validateArray(arrayTypeDescription, payload);
    
    // If a non-array payload has been passed in, then we need to check which form of validation
    // to use, by checking the structure of the array.
    const { structure } = arrayTypeDescription();
    if (structure().type === PROP_TYPES._shape) return validateObject(structure, payload);
    return validatePrimitive(structure, payload);
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
