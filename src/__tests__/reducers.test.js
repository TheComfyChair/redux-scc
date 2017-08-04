//@flow
import {
    Types,
    PROP_TYPES,
} from '../structure';
import {
    calculateDefaults,
    determineReducerType,
    callReducer,
    createReducerBehaviors,
    REDUCER_CREATOR_MAPPING,
} from '../reducers';
import forEach from 'lodash/forEach';
import omit from 'lodash/omit';

describe('reducers', () => {

    describe('calculateDefaults', () => {
        it('Should provide correct default values for a given primitive type', () => {
            expect(calculateDefaults(Types.string('toast'))).toBe('toast');
            expect(calculateDefaults(Types.number(3))).toBe(3);
            expect(calculateDefaults(Types.string())).toBe('');
            expect(calculateDefaults(Types.number())).toBe(0);
        });

        it('Should provide correct default values for an object', () => {
            const objectStructure = Types.shape({
                test1: Types.string(),
                test2: Types.number(),
            });
            expect(calculateDefaults(objectStructure)).toEqual({ test1: '', test2: 0 });
        });

        it('Should provide correct default values for nested object', () => {
            const objectStructure = Types.shape({
                test1: Types.string(),
                test2: Types.number(),
                test3: Types.shape({
                    test4: Types.string('foo'),
                })
            });
            expect(calculateDefaults(objectStructure)).toEqual({
                test1: '',
                test2: 0,
                test3: {
                    test4: 'foo'
                }
            });
        });
    });

    describe('determineReducerType', () => {
        it('should return the correct creator function for the default mapping', () => {
            forEach({ custom: Types.custom(), ...omit(Types, 'reducer', 'wildcardKey', 'custom') }, structureType => {
                const returnVal = determineReducerType(Types.reducer(structureType()), {
                    name: 'toast',
                    locationString: 'toasty',
                });

                expect({
                    ...returnVal,
                    reducerFn: returnVal.reducerFn.name,
                    reducerStructureDescriptor: returnVal.reducerStructureDescriptor.name,
                }).toEqual({
                    name: 'toast',
                    reducerFn: REDUCER_CREATOR_MAPPING[structureType()().type].name,
                    reducerStructureDescriptor: '', //The internal functions should be anonymous
                    locationString: 'toasty',
                });
            });
        });

        it('should throw an error if the type provided does not match any in the mapping', () => {
            expect(() => determineReducerType(Types.reducer(Types.string()), {
                name: 'toast',
                locationString: 'toasty',
                reducerCreatorMapping: omit(REDUCER_CREATOR_MAPPING, PROP_TYPES._string),
            })).toThrowError(/createReducer/)
        });
    });

    describe('callReducer', () => {
        it('should call the provided reducer with the structure description, location string, and name', () => {
            expect(callReducer({
                reducerStructureDescriptor: 'foo',
                name: 'toast',
                locationString: 'toasty',
                reducerFn: (reducerStructureDescriptor, { locationString, name }) => ({ reducerStructureDescriptor, locationString, name })
            })).toEqual({
                reducerStructureDescriptor: 'foo',
                locationString: 'toasty',
                name: 'toast',
            })
        });
    });

    describe('createReducerBehaviors', () => {
        it('Should return only the reducers of the behavior config and prepend the locationString', () => {
            expect(createReducerBehaviors({
                'toast': {
                    reducer: 'foo',
                    action: 'bar',
                    validate: true,
                }
            }, 'location')).toEqual({
                'location.toast': {
                    reducer: 'foo',
                    action: 'bar',
                    validate: true,
                },
            })
        });
    });

});