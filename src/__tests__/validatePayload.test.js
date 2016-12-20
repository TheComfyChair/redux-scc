import { Types } from '../structure';
import {
    validatePrimitive,
    validateShape,
    validateArray,
    getTypeValidation
} from '../validatePayload';

describe('Validation functionality', () => {

    describe('Primitives', () => {
        it('Number primitive should allow for numbers', () => {
            expect(validatePrimitive(Types.number(), 3)).toBe(3);
        });
        it('String primitive should allow for string', () => {
            expect(validatePrimitive(Types.string(), 'toast')).toBe('toast');
        });
        it('Boolean primitive should allow for string', () => {
            expect(validatePrimitive(Types.boolean(), true)).toBe(true);
        });
    });

    describe('Arrays', () => {
        const testArrayStructure = Types.arrayOf(Types.string());
        it('Arrays should allow for primitives', () => {
            expect(validateArray(testArrayStructure, ['a','b','c','d']))
                .toEqual(['a','b','c','d']);
        });
        it('Arrays should strip values for primitives which fail the test', () => {
            expect(validateArray(testArrayStructure, ['a','b',3,'d']))
                .toEqual(['a','b','d']);
        });

        const testArrayStructure2 = Types.arrayOf(Types.shape({
            test1: Types.number()
        }));
        it('Arrays should allow for complex objects', () => {
            expect(validateArray(testArrayStructure2, [{test1: 3},{test1: 4}]))
                .toEqual([{test1: 3},{test1: 4}]);
        });
        const testArrayStructure3 = Types.arrayOf(Types.shape({
            test1: Types.arrayOf(Types.number())
        }));
        it('Arrays should allow for complex objects - test 2', () => {
            expect(validateArray(testArrayStructure3, [{test1: [3,4,5]}]))
                .toEqual([{test1: [3,4,5]}]);
        });
        it('Array should return an empty array if a non-array is passed', () => {
            expect(validateArray('foo')).toEqual([]);
        })
    });

    describe('Objects', () => {
        const testObjectStructure = Types.shape({
            test1: Types.string(),
            test2: Types.number()
        });
        it('Object of primitives should allow all props present in the structure', () => {
            expect(validateShape(testObjectStructure, { test1: 'toast', test2: 3 }))
                .toEqual({ test1: 'toast', test2: 3 });
        });
        it('Object of primitives should only allow for props with values which match their config', () => {
            expect(validateShape(testObjectStructure, { test1: 5, test2: 3 }))
                .toEqual({ test2: 3 });
        });
        it('Object of primitives should strip any properties not part of the config', () => {
            expect(validateShape(testObjectStructure, { test1: 'toast', test2: 3, toast: 'bar' }))
                .toEqual({ test1: 'toast', test2: 3 });
        });

        const testObjectStructure2 = Types.shape({
            test1: testObjectStructure,
        });
        it('Objects should allow for arbitrary nesting of objects', () => {
            expect(validateShape(testObjectStructure2, { test1: { test1: 'toast', test2: 3 } }))
                .toEqual({ test1: { test1: 'toast', test2: 3 } });
        });

        const testObjectStructure3 = Types.shape({
            test1: Types.shape({
                test2: Types.string(),
            }),
            test2: Types.string(),
        });
        it('Objects containing objects should properly check if an object is provided', () => {
            expect(validateShape(testObjectStructure3, { test1: 'foo', test2: 'bar' })).toEqual({
                test1: {},
                test2: 'bar',
            });
        })
    });

    describe('Non covered types', () => {
        it('A type with no associated validation should throw an error', () => {
            expect(() => getTypeValidation('toast')).toThrowError(/validation/);
        });
    });

});
