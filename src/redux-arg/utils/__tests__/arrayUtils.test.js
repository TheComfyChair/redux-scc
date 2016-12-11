import {
    updateAtIndex,
    removeAtIndex,
} from '../arrayUtils';

describe('Array utilities', () => {
    describe('updateAtIndex', () => {
        it('Should throw error if attempting to update without an index', () => {
            expect(() => updateAtIndex([1,2,3], 4)).toThrowError(/index/);
        });

        it('Should throw error if attempting to update with a non numeric index', () => {
            expect(() => updateAtIndex([1,2,3], 4, 'toast')).toThrowError(/index/);
        });

        it('Should throw error if attempting to update with an out of range index', () => {
            expect(() => updateAtIndex([1,2,3], 4, 4)).toThrowError(/index/);
        });
        
        it('Should update value at the correct index', () => {
            expect(updateAtIndex([1,2,3], 4, 0)).toEqual([4,2,3]);
            expect(updateAtIndex([1,2,3], 4, 1)).toEqual([1,4,3]);
            expect(updateAtIndex([1,2,3], 4, 2)).toEqual([1,2,4]);
        });
    });

    describe('removeAtIndex', () => {
        it('Should throw error if attempting to remove without an index', () => {
            expect(() => removeAtIndex([1,2,3])).toThrowError(/index/);
        });

        it('Should throw error if attempting to remove with a non numeric index', () => {
            expect(() => removeAtIndex([1,2,3], 'toast')).toThrowError(/index/);
        });

        it('Should throw error if attempting to remove with an out of range index', () => {
            expect(() => removeAtIndex([1,2,3], 4)).toThrowError(/index/);
        });

        it('Should remove value at the correct index', () => {
            expect(removeAtIndex([1,2,3], 0)).toEqual([2,3]);
            expect(removeAtIndex([1,2,3], 1)).toEqual([1,3]);
            expect(removeAtIndex([1,2,3], 2)).toEqual([1,2]);
        });
    });
});
