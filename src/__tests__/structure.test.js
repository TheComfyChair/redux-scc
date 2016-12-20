import { Types, PROP_TYPES } from '../structure';

function hasType(object, type) {
    return object.type === type;
}

describe('Type descriptions', () => {
    it('will return a function which subsequently returns an object with the correct type', () => {
        expect(hasType(Types.string()(), PROP_TYPES._string)).toBeTruthy();
        expect(hasType(Types.number()(), PROP_TYPES._number)).toBeTruthy();
        expect(hasType(Types.boolean()(), PROP_TYPES._boolean)).toBeTruthy();
        expect(hasType(Types.arrayOf()(), PROP_TYPES._array)).toBeTruthy();
        expect(hasType(Types.reducer()(), PROP_TYPES._reducer)).toBeTruthy();
        expect(hasType(Types.shape()(), PROP_TYPES._shape)).toBeTruthy();
    });

    it('will return the standard default values when none provided', () => {
        expect(Types.string()().defaultValue).toBe('');
        expect(Types.number()().defaultValue).toBe(0);
        expect(Types.boolean()().defaultValue).toBe(false);
        expect(Types.arrayOf()().defaultValue).toEqual([]);
    });

    it('will return the default value provided (except for reducer and shape)', () => {
        expect(Types.string('foo')().defaultValue).toBe('foo');
        expect(Types.number(5)().defaultValue).toBe(5);
        expect(Types.boolean(true)().defaultValue).toBe(true);
        expect(Types.arrayOf(Types.number(), [1, 2, 3])().defaultValue).toEqual([1, 2, 3]);
    });

    it('will return the correct typeofValue (for string, number, and boolean)', () => {
        expect(Types.string()().typeofValue).toBe('string');
        expect(Types.number()().typeofValue).toBe('number');
        expect(Types.boolean()().typeofValue).toBe('boolean');
    });

    it('will return the correct structure (for arrayOf, reducer, and shape)', () => {
        const structureTest = Types.string();
        expect(Types.shape(structureTest)().structure).toEqual(structureTest);
        expect(Types.arrayOf(structureTest)().structure).toEqual(structureTest);
        expect(Types.reducer(structureTest)().structure).toEqual(structureTest);
    });
});
