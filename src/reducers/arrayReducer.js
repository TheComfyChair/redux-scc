//@flow
//==============================
// Flow imports
//==============================
import type { ArrayStructureType } from '../structure';

//==============================
// Flow types
//==============================
export type ArrayReducerAction = {
    type: string,
    payload: any,
    index?: number,
};
export type ArrayReducer = (state: Array<any>, action: ArrayReducerAction) => Array<any>;
export type ArrayReducerBehavior = (state: Array<any>, payload: any, initialState: Array<any>, index: number) => Array<any>;
export type ArrayReducerBehaviorsConfig = {
    [key: string]: {
        action?: (value: any) => any,
        reducer: ArrayReducerBehavior,
        validate: boolean,
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
    name: string,
};
export type ArraySelector = (state: Object) => Array<any>;

//==============================
// JS imports
//==============================
import reduce from 'lodash/reduce';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import { validateArray, validateShape, validatePrimitive } from '../validatePayload';
import { createReducerBehaviors } from '../reducers';
import { updateAtIndex, removeAtIndex } from '../utils/arrayUtils';
import { PROP_TYPES } from '../structure';


function checkIndex(index: ?number, payload: any = '', behaviorName: string): boolean {
    if (!isNumber(index) || index === -1) {
        console.warn(`Index not passed to ${behaviorName} for payload ${payload}.`);
        return false;
    }
    return true;
}


//==============================
// Array behaviors
// ----------------
// Arrays are more complicated than shape or primitive reducers, due to
// the complexities in amending specific elements. Of course, the behaviours
// could still follow and the same pattern as the other reducers and simply
// make the end user replace the correct index themselves. However, it made sense
// to create a few helper behaviors to aid with the most common array operations.
//==============================
export const DEFAULT_ARRAY_BEHAVIORS: ArrayReducerBehaviorsConfig = {
    //Index specific behaviors.
    replaceAtIndex: {
        reducer(state, payload, initialState, index) {
            if (!checkIndex(index, payload, 'updateAtIndex')) return state;
            if (payload === undefined) return console.warn('Undefined was passed when updating index. Update not performed') || state;
            return updateAtIndex(state, payload, index);
        },
        validate: true,
    },
    resetAtIndex: {
        reducer(state, payload, initialState, index) {
            if (!checkIndex(index, payload, 'resetAtIndex')) return state;
            return updateAtIndex(state, initialState, index);
        },
        validate: false,
    },
    removeAtIndex: {
        reducer(state, index) {
            if (!checkIndex(index, '', 'removeAtIndex')) return state;
            return removeAtIndex(state, index);
        },
        validate: false,
    },
    //Whole array behaviors.
    replace: {
        reducer(state, payload) {
            if(!isArray(payload)) return console.warn('An array must be provided when replacing an array') || state;
            return payload;
        },
        validate: true,
    },
    reset: {
        reducer(state, payload, initialState) {
            return initialState;
        },
        validate: false,
    },
    push: {
        reducer(state, payload) {
            return [...state, payload];
        },
        validate: true,
    },
    pop: {
        reducer(state) {
            return state.slice(0, -1);
        },
        validate: false,
    },
    unshift: {
        reducer(state, payload) {
            return [payload, ...state];
        },
        validate: true,
    },
    shift: {
        reducer(state) {
            return state.slice(1);
        },
        validate: false,
    }
};


export function createArrayReducer(arrayTypeDescription: ArrayStructureType, {
    locationString,
    name,
}: ArrayReducerOptions) {
    return {
        reducers: {
            [name]: createReducer(arrayTypeDescription, createReducerBehaviors(DEFAULT_ARRAY_BEHAVIORS, locationString))
        },
        actions: createActions(DEFAULT_ARRAY_BEHAVIORS, locationString, {}),
    };
}


export function createReducer(arrayTypeDescription: ArrayStructureType, behaviors: ArrayReducerBehaviors): ArrayReducer {
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
        return behaviors[type].reducer(
          state,
          behaviors[type].validate ? applyValidation(arrayTypeDescription, payload) : payload,
          initialValue,
          index
        );
    }
}


export function applyValidation(arrayTypeDescription: ArrayStructureType, payload: any) {
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
    if (structure().type === PROP_TYPES._shape) return validateShape(structure, payload);
    return validatePrimitive(structure, payload);
}


function createActions(behaviorsConfig: ArrayReducerBehaviorsConfig, locationString: string): ArrayActions {
    //Take a reducer behavior config object, and create actions using the location string
    return reduce(behaviorsConfig, (memo, behavior, name) => ({
        ...memo,
        [name]: (payload: Array<any>, index: ?number) => ({
            type: `${locationString}.${name}`,
            payload: (behavior.action || (payload => payload))(payload),
            index,
        })
    }), {});
}
