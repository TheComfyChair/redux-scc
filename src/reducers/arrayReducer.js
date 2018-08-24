//@flow
//==============================
// Flow imports
//==============================
import type { ArrayStructureType } from "../structure";

//==============================
// Flow types
//==============================
export type ArrayReducerAction = {
  type: string,
  payload: any,
  index?: number
};
export type ArrayReducer = (
  state: Array<any>,
  action: ArrayReducerAction
) => Array<any>;
export type ArrayReducerBehavior = (
  state: Array<any>,
  payload: any,
  initialState: Array<any>,
  index: number
) => Array<any>;
export type ArrayReducerBehaviorsConfig = {
  [key: string]: {
    action?: (value: any) => any,
    reducer: ArrayReducerBehavior,
    validate: boolean
  }
};
export type ArrayReducerBehaviors = {
  [key: string]: ArrayReducerBehavior
};
export type ArrayAction = (
  value: Array<any>
) => { type: string, payload: any, index?: number };
export type ArrayActions = {
  [key: string]: Array<any>
};
export type ArrayReducerOptions = {
  behaviorsConfig: ArrayReducerBehaviorsConfig,
  locationString: string,
  name: string
};
export type ArraySelector = (state: Object) => Array<any>;

//==============================
// JS imports
//==============================
import isArray from "lodash/isArray";
import isNumber from "lodash/isNumber";
import {
  validateArray,
  validateShape,
  validateValue
} from "../validatePayload";
import { createReducerBehaviors } from "../reducers";
import { updateAtIndex, removeAtIndex } from "../utils/arrayUtils";
import { PROP_TYPES } from "../structure";
import { isCombinedAction, getApplicableCombinedActions } from "./batchUpdates";
import { findIndex, isEqual } from "lodash/fp";

const reduce = require("lodash/fp/reduce").convert({ cap: false });

function checkIndex(
  index: ?number,
  payload: any = "",
  behaviorName: string
): boolean {
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
      if (!checkIndex(index, payload, "updateAtIndex")) return state;
      if (payload === undefined)
        return (
          console.warn(
            "Undefined was passed when updating index. Update not performed"
          ) || state
        );
      return updateAtIndex(state, payload, index);
    },
    validate: true
  },
  resetAtIndex: {
    reducer(state, payload, initialState, index) {
      if (!checkIndex(index, payload, "resetAtIndex")) return state;
      return updateAtIndex(state, initialState, index);
    },
    validate: false
  },
  removeAtIndex: {
    reducer(state, index) {
      if (!checkIndex(index, "", "removeAtIndex")) return state;
      return removeAtIndex(state, index);
    },
    validate: false
  },
  //Whole array behaviors.
  replace: {
    reducer(state, payload) {
      if (!isArray(payload))
        return (
          console.warn("An array must be provided when replacing an array") ||
          state
        );
      return payload;
    },
    validate: true
  },
  reset: {
    reducer(state, payload, initialState) {
      return initialState;
    },
    validate: false
  },
  push: {
    reducer(state, payload) {
      return [...state, payload];
    },
    validate: true
  },
  pushOrRemove: {
    reducer(state, payload) {
      let index = findIndex(isEqual(payload))(state);
      if(index == -1) {
        return [...state, payload];
      }
      return removeAtIndex(state, index);
    },
    validate: true
  },
  pop: {
    reducer(state) {
      return state.slice(0, -1);
    },
    validate: false
  },
  unshift: {
    reducer(state, payload) {
      return [payload, ...state];
    },
    validate: true
  },
  shift: {
    reducer(state) {
      return state.slice(1);
    },
    validate: false
  }
};

export function createArrayReducer(
  arrayTypeDescription: ArrayStructureType,
  { locationString, name }: ArrayReducerOptions
) {
  const uniqueId = Math.random()
    .toString(36)
    .substring(5);
  return {
    reducers: {
      [name]: createReducer(
        arrayTypeDescription,
        createReducerBehaviors(
          DEFAULT_ARRAY_BEHAVIORS,
          `${uniqueId}-${locationString}`
        )
      )
    },
    actions: createActions(
      DEFAULT_ARRAY_BEHAVIORS,
      `${uniqueId}-${locationString}`,
      {}
    )
  };
}

export function createReducer(
  arrayTypeDescription: ArrayStructureType,
  behaviors: ArrayReducerBehaviors
): ArrayReducer {
  //Take the initial value specified as the default for the array, then apply it, using the validation
  //when doing so. The initial value must be an array.
  const initialValue = validateArray(
    arrayTypeDescription,
    arrayTypeDescription().defaultValue
  );

  //Return the array reducer.
  return (
    state: Array<any> = initialValue,
    { type, payload, index }: ArrayReducerAction
  ) => {
    const matchedBehaviors = behaviors[type]
      ? [{ type, payload }]
      : isCombinedAction(type)
        ? getApplicableCombinedActions(behaviors)(payload)
        : [];

    if (matchedBehaviors.length) {
      //Call every behaviour relevant to this reducer as part of this action call,
      //and merge the result (later actions take priority).
      //Sanitize the payload using the reducer shape, then apply the sanitized
      //payload to the state using the behavior linked to this action type.
      return reduce(
        (interimState, matchedBehavior) =>
          behaviors[matchedBehavior.type].reducer(
            interimState,
            behaviors[matchedBehavior.type].validate
              ? applyValidation(arrayTypeDescription, matchedBehavior.payload)
              : matchedBehavior.payload,
            initialValue,
            index
          ),
        state
      )(matchedBehaviors);
    }

    //If the action type does not match any of the specified behaviors, just return the current state.
    return state;
  };
}

export function applyValidation(
  arrayTypeDescription: ArrayStructureType,
  payload: any
) {
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
  if (structure().type === PROP_TYPES._shape)
    return validateShape(structure, payload);
  return validateValue(structure, payload);
}

function createActions(
  behaviorsConfig: ArrayReducerBehaviorsConfig,
  locationString: string
): ArrayActions {
  //Take a reducer behavior config object, and create actions using the location string
  return reduce(
    (memo, behavior, name) => ({
      ...memo,
      [name]: (payload: Array<any>, index: ?number) => ({
        type: `${locationString}.${name}`,
        payload: (behavior.action || (payload => payload))(payload),
        index
      })
    }),
    {}
  )(behaviorsConfig);
}
