//@flow
import keys from 'lodash/fp/keys';
import includes from 'lodash/fp/includes';
import filter from 'lodash/fp/filter';

export const BATCH_UPDATE = '(redux-scc-batch-action)';


type BatchUpdateInterface = {
  name?: string,
  actions: Array<{ type: string, payload: any, meta?: any }>,
};
type Behaviors = {
  [key: string]: {
    [key: string]: {
      reducer: (state: mixed, payload: mixed | void, initialState: mixed) => mixed,
    },
  };
}

export const createCombinedAction = ({
  name = '',
  actions,
}: BatchUpdateInterface) => ({
  type: `${ name }${ BATCH_UPDATE }`,
  payload: actions,
});


export const isCombinedAction = (actionType: string) => actionType
  ? actionType.indexOf(BATCH_UPDATE) > -1
  : false;


export const getApplicableCombinedActions = (behaviors: Behaviors) =>
  filter(({ type }) => includes(type)(keys(behaviors)));