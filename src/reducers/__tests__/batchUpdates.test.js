//@flow
import {
  getApplicableBatchActions,
  batchUpdate,
  isBatchAction,
  BATCH_UPDATE,
} from '../batchUpdates';


describe('getApplicableBatchActions', () => {
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
    expect(getApplicableBatchActions(exampleBehaviors)(exampleBatchActions)).toEqual([
      { type: 'foo', payload: 'boop' },
    ]);
  });
});


describe('isBatchAction', () => {
  it('should return true if action contains batch action string', () => {
    expect(isBatchAction(`Boop!${ BATCH_UPDATE }`)).toBe(true);
  });


  it('should return false if action does not contain batch action string', () => {
    expect(isBatchAction('')).toBe(false);
  });


  it('should not crash if undefined or null is passed', () => {
    expect(isBatchAction()).toBe(false);
    expect(isBatchAction(null)).toBe(false);
  });
});


describe('batchUpdate action', () => {
  it('should return an action with a type including the batch update string and name', () => {
    expect(batchUpdate({
      name: 'boop!'
    }).type).toMatch(new RegExp(`${ BATCH_UPDATE }`));
  });


  it('should return actions as the payload', () => {
    const example = [];
    expect(batchUpdate({
      actions: example,
    }).payload).toBe(example);
  });
});