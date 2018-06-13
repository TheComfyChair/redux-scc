//@flow
import keys from "lodash/fp/keys";
import includes from "lodash/fp/includes";
import filter from "lodash/fp/filter";

export const COMBINED_ACTION = "/@@redux-scc-combined-action";

type BatchUpdateInterface = {
  name?: string,
  actions: Array<{ type: string, payload: any, meta?: any }>
};
type Behaviors = {
  [key: string]: {
    [key: string]: {
      reducer: (
        state: mixed,
        payload: mixed | void,
        initialState: mixed
      ) => mixed
    }
  }
};

export const createCombinedAction = ({
  name = "",
  actions
}: BatchUpdateInterface) => ({
  type: `${name}${COMBINED_ACTION}`,
  payload: actions
});

export const isCombinedAction = (actionType: string) =>
  actionType ? actionType.indexOf(COMBINED_ACTION) > -1 : false;

export const getApplicableCombinedActions = (behaviors: Behaviors) =>
  filter(({ type }) => includes(type)(keys(behaviors)));
