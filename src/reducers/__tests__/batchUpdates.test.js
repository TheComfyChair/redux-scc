//@flow
import {
  getApplicableCombinedActions,
  createCombinedAction,
  isCombinedAction,
  COMBINED_ACTION,
} from '../batchUpdates';


describe('getApplicableCombinedActions', () => {
  const exampleBehaviors = {
    foo: {
      reducer: () => {},
    },
  };
  const exampleBatchActions = [
    { type: 'foo', payload: 'boop' },
    { type: 'bar', payload: 'boop' },
  ];

  it('should return an array of all applicable batch actions', () => {
    expect(getApplicableCombinedActions(exampleBehaviors)(exampleBatchActions)).toEqual([
      { type: 'foo', payload: 'boop' },
    ]);
  });
});


describe('isCombinedAction', () => {
  it('should return true if action contains batch action string', () => {
    expect(isCombinedAction(`Boop!${ COMBINED_ACTION }`)).toBe(true);
  });


  it('should return false if action does not contain batch action string', () => {
    expect(isCombinedAction('')).toBe(false);
  });


  it('should not crash if undefined or null is passed', () => {
    expect(isCombinedAction()).toBe(false);
    expect(isCombinedAction(null)).toBe(false);
  });
});


describe('createCombinedAction action', () => {
  it('should return an action with a type including the batch update string and name', () => {
    expect(createCombinedAction({
      name: 'boop!'
    }).type).toMatch(new RegExp(`${ COMBINED_ACTION }`));
  });


  it('should return actions as the payload', () => {
    const example = [];
    expect(createCombinedAction({
      actions: example,
    }).payload).toBe(example);
  });
});