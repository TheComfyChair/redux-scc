import {
    DEFAULT_ARRAY_BEHAVIORS,
    applyValidation,
    createReducer,
} from '../arrayReducer';
import {
    createReducerBehaviors,
} from '../../reducers';
import {
    Types
} from '../../structure';

describe('arrayReducer', () => {

    describe('behaviors', () => {

        describe('replaceAtIndex', () => {
            const { replaceAtIndex } = DEFAULT_ARRAY_BEHAVIORS;
            it('should update at index correctly', () => {
                expect(replaceAtIndex.reducer([1,2,3], 4, [], 0)).toEqual([4,2,3]);
            });
            it('should return state if index not passed', () => {
                expect(replaceAtIndex.reducer([1,2,3], 4, [])).toEqual([1,2,3]);
            });
            it('should return state if no payload passed', () => {
                expect(replaceAtIndex.reducer([1,2,3], undefined, [], 0)).toEqual([1,2,3]);
            });
        });

        describe('resetAtIndex', () => {
            const { resetAtIndex } = DEFAULT_ARRAY_BEHAVIORS;
            it('should reset at index correctly', () => {
                expect(resetAtIndex.reducer([1,2,3], undefined, 0, 0)).toEqual([0,2,3]);
            });
            it('should return state if no index provided', () => {
                expect(resetAtIndex.reducer([1,2,3], undefined, 0)).toEqual([1,2,3]);
            });
        });

        describe('removeAtIndex', () => {
            const { removeAtIndex } = DEFAULT_ARRAY_BEHAVIORS;
            it('should remove at index correctly', () => {
                expect(removeAtIndex.reducer([1,2,3], 0)).toEqual([2,3]);
            });
            it('should return state if no index provided', () => {
                expect(removeAtIndex.reducer([1,2,3])).toEqual([1,2,3]);
            });
        });

        describe('replace', () => {
            const { replace } = DEFAULT_ARRAY_BEHAVIORS;
            it('should return state if payload is not an array', () => {
                expect(replace.reducer([1,2,3], '')).toEqual([1,2,3]);
            });
            it('should return the new array', () => {
                expect(replace.reducer([1,2,3], [4,5,6])).toEqual([4,5,6]);
            });
        });

        describe('reset', () => {
            const { reset } = DEFAULT_ARRAY_BEHAVIORS;
            it('should reset the state', () => {
                expect(reset.reducer([1,2,3], undefined, [4,5,6])).toEqual([4,5,6]);
            });
        });

        describe('push', () => {
            const { push } = DEFAULT_ARRAY_BEHAVIORS;
            it('should push the payload onto the end of the array', () => {
                expect(push.reducer([1,2,3], 4)).toEqual([1,2,3,4]);
            });
        });

        describe('pushOrRemove', () => {
            const { pushOrRemove } = DEFAULT_ARRAY_BEHAVIORS;
            it('should push the primitive payload onto the end of the array', () => {
                expect(pushOrRemove.reducer([1,2,3], 4)).toEqual([1,2,3,4]);
            });
            it('should remove the primitive payload from the array', () => {
                expect(pushOrRemove.reducer([1,2,3], 2)).toEqual([1,3]);
            });
            it('should push the object payload onto the end of the array', () => {
                let users = [
                    { 'user': 'barney',  'active': false },
                    { 'user': 'fred',    'active': false }
                ];
                let expected_users = [
                    { 'user': 'barney',  'active': false },
                    { 'user': 'fred',    'active': false },
                    { 'user': 'pebbles', 'active': true }
                ];
                expect(pushOrRemove.reducer(users, { 'user': 'pebbles', 'active': true })).toEqual(expected_users);
            });
            it('should remove the object payload from the array', () => {
                let users = [
                    { 'user': 'barney',  'active': false },
                    { 'user': 'fred',    'active': false },
                    { 'user': 'pebbles', 'active': true }
                ];
                let expected_users = [
                    { 'user': 'barney',  'active': false },
                    { 'user': 'pebbles', 'active': true }
                ];
                expect(pushOrRemove.reducer(users, { 'user': 'fred', 'active': false })).toEqual(expected_users);
            });
        });

        describe('pop', () => {
            const { pop } = DEFAULT_ARRAY_BEHAVIORS;
            it('should remove the last element from the array', () => {
                expect(pop.reducer([1,2,3])).toEqual([1,2]);
            });
        });

        describe('unshift', () => {
            const { unshift } = DEFAULT_ARRAY_BEHAVIORS;
            it('should add the payload to the beginning of the array', () => {
                expect(unshift.reducer([1,2,3], 4)).toEqual([4,1,2,3]);
            });
        });

        describe('shift', () => {
            const { shift } = DEFAULT_ARRAY_BEHAVIORS;
            it('should remove the first element of the array', () => {
                expect(shift.reducer([1,2,3])).toEqual([2,3]);
            });
        });
    });

    describe('applyValidation', () => {
        const arrayStructure = Types.arrayOf(Types.number());
        const arrayStructure2 = Types.arrayOf(Types.shape({ foo: Types.string() }));
        it('should validate arrays correctly', () => {
            expect(applyValidation(arrayStructure, [1,2,3])).toEqual([1,2,3]);
            expect(applyValidation(arrayStructure, [1, 'foo', 3])).toEqual([1, 3]);
        });
        it('should validate non array primitive payloads correctly', () => {
            expect(applyValidation(arrayStructure, 1)).toEqual(1);
        });
        it('should validate none array object payloads correctly', () => {
            expect(applyValidation(arrayStructure2, { foo: 'toast' })).toEqual({ foo: 'toast' });
        });
    });

    describe('createReducer', () => {
        const arrayStructure = Types.arrayOf(Types.number(), [1,2,3,4]);
        const reducer = createReducer(arrayStructure, createReducerBehaviors(DEFAULT_ARRAY_BEHAVIORS, 'string'));

        it('should call the correct behavior', () => {
            expect(reducer([1,2,3], {
                type: 'string.replaceAtIndex',
                payload: 4,
                index: 0,
            })).toEqual([4,2,3]);
        });

        it('do not trigger validation if not required', () => {
            expect(reducer([1,2], {
              type: 'string.reset',
            })).toEqual([1,2,3,4]);
        });
    });

});