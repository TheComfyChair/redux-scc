//@flow
//==============================
// Flow imports
//==============================
import type { PrimitiveType } from "../structure";

//==============================
// Flow types
//==============================
export type PrimitiveReducerAction = {
  type: string,
  payload: mixed
};
export type PrimitiveReducer = (
  state: mixed,
  action: PrimitiveReducerAction
) => mixed;
export type PrimitiveReducerBehavior = (
  state: mixed,
  payload: mixed | void,
  initialState: mixed
) => mixed;
export type PrimitiveReducerBehaviorsConfig = {
  [key: string]: {
    action?: (value: mixed) => mixed,
    reducer: PrimitiveReducerBehavior,
    validate: boolean
  }
};
export type PrimitiveReducerBehaviors = {
  [key: string]: PrimitiveReducerBehavior
};
export type PrimitiveAction = (
  value: mixed
) => { type: string, payload: mixed };
export type PrimitiveActions = {
  [key: string]: PrimitiveAction
};
export type PrimitiveReducerOptions = {
  behaviorsConfig: PrimitiveReducerBehaviorsConfig,
  locationString: string,
  name: string
};

//==============================
// JS imports
//==============================
import { validateValue } from "../validatePayload";
import { createReducerBehaviors } from "../reducers";
import { isCombinedAction, getApplicableCombinedActions } from "./batchUpdates";

const reduce = require("lodash/fp/reduce").convert({ cap: false });

//==============================
// Primitive behaviors
// ----------------
// Primitives are the most simple case, as they only have the replace and
// reset behaviors by default.
//==============================

export const DEFAULT_PRIMITIVE_BEHAVIORS: PrimitiveReducerBehaviorsConfig = {
  replace: {
    reducer(state, payload) {
      if (payload === undefined) return state;
      return payload;
    },
    validate: true
  },
  reset: {
    reducer(state, payload, initialState) {
      return initialState;
    },
    validate: false
  }
};

export function createPrimitiveReducer(
  primitiveType: PrimitiveType,
  { locationString, name }: PrimitiveReducerOptions
) {
  const uniqueId = Math.random()
    .toString(36)
    .substring(5);
  return {
    reducers: {
      [name]: createReducer(
        primitiveType,
        createReducerBehaviors(
          DEFAULT_PRIMITIVE_BEHAVIORS,
          `${uniqueId}-${locationString}`
        )
      )
    },
    actions: createActions(
      DEFAULT_PRIMITIVE_BEHAVIORS,
      `${uniqueId}-${locationString}`
    )
  };
}

function createReducer(
  primitiveType: PrimitiveType,
  behaviors: PrimitiveReducerBehaviors
): PrimitiveReducer {
  //Calculate and validate the initial state of the reducer
  const initialState: mixed = validateValue(
    primitiveType,
    primitiveType().defaultValue
  );
  return (state = initialState, { type, payload }: PrimitiveReducerAction) => {
    //If the action type does not match any of the specified behaviors, just return the current state.
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
              ? validateValue(primitiveType, matchedBehavior.payload)
              : matchedBehavior.payload,
            initialState
          ),
        state
      )(matchedBehaviors);
    }

    return state;
  };
}

function createActions(
  behaviorsConfig: PrimitiveReducerBehaviorsConfig,
  locationString: string
): PrimitiveActions {
  //Take a reducer behavior config object, and create actions using the location string
  return reduce(
    (memo, behavior, name) => ({
      ...memo,
      [name]: (payload: mixed) => ({
        type: `${locationString}.${name}`,
        payload: (behavior.action || (payload => payload))(payload)
      })
    }),
    {}
  )(behaviorsConfig);
}
