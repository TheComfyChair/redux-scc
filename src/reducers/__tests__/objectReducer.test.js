import {
    DEFAULT_SHAPE_BEHAVIORS,
    calculateDefaults,
    createReducer,
} from '../objectReducer';
import {
    createReducerBehaviors,
} from '../../reducers';
import { Types } from '../../structure';

describe('ObjectReducer', () => {

    describe('behaviors', () => {

        describe('replace', () => {
            const { replace } = DEFAULT_SHAPE_BEHAVIORS;
            it('reducer should return the state if the payload is undefined', () => {
                expect(replace.reducer({ foo: 1 }, undefined)).toEqual({ foo: 1 });
            });
            it('reducer should return the new state', () => {
                expect(replace.reducer({ foo: 1 }, { foo: 2 })).toEqual({ foo: 2 });
            });
        });

        describe('reset', () => {
            const { reset } = DEFAULT_SHAPE_BEHAVIORS;
            it('reducer should return the initial state', () => {
                expect(reset.reducer({ foo: 1 }, undefined, { foo: 2 })).toEqual({ foo: 2 });
            });

            it('reducer should apply the payload (if an object) to the store over the default state', () => {
               expect(reset.reducer({ foo: 23, bar: 4 }, { foo: 1 }, { foo: 4, bar: 5 })).toEqual({foo: 1, bar: 5});
            });

            it('reducer should return initial state if the payload is not an object', () => {
               expect(reset.reducer({ foo: 23, bar: 4 }, 'nope!', { foo: 4, bar: 5 })).toEqual({foo: 4, bar: 5});
            });
        });

        describe('update', () => {
            const { update } = DEFAULT_SHAPE_BEHAVIORS;
            it('reducer should return the shallow merged new state', () => {
                expect(update.reducer({ foo: 1, bar: 2 }, { foo: 3 })).toEqual({ foo: 3, bar: 2 });
            });
            it('reducer should return state if payload is not an object', () => {
                expect(update.reducer({ foo: 1, bar: 2}, 'toast')).toEqual({ foo: 1, bar: 2 });
            });
        });

    });

    describe('calculateDefaults', () => {
        const structure = {
            foo: Types.string('foo'),
            bar: Types.shape({
                baz: Types.number(5),
            }),
        };

        expect(calculateDefaults(structure)).toEqual({
            foo: 'foo',
            bar: {
                baz: 5,
            }
        });
    });

    describe('createReducer', () => {
        const shapeStructure = Types.shape({
            foo: Types.string('foo'),
            bar: Types.shape({
                baz: Types.number(5),
            }),
        });
        const reducer = createReducer(shapeStructure, createReducerBehaviors(DEFAULT_SHAPE_BEHAVIORS, 'string'));
        it('call the correct behavior', () => {
            expect(reducer({ foo: 'foo', bar: { baz: 5 }}, {
                type: 'string.update',
                payload: { foo: 'toast'}
            })).toEqual({ foo: 'toast', bar: { baz: 5 }});
        });

        it('do not trigger validation if not required', () => {
          expect(reducer({ foo: 'foo', bar: { baz: 6 }}, {
            type: 'string.reset',
          })).toEqual({ foo: 'foo', bar: { baz: 5 }});
        });
    });

});