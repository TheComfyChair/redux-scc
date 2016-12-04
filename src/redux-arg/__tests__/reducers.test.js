//@flow
import { Types } from '../structure';
import { calculateDefaults } from '../reducers';

describe('reducers', () => {

    describe('defaultValues', () => {
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

});