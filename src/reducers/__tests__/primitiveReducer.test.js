import { DEFAULT_PRIMITIVE_BEHAVIORS } from '../primitiveReducer';

describe('PrimitiveReducer', () => {

    describe('behaviors', () => {
        
        describe('replace', () => {
            const { replace } = DEFAULT_PRIMITIVE_BEHAVIORS;
            it('reducer should return the state if the payload is undefined', () => {
                expect(replace.reducer('foo', undefined)).toEqual('foo');
            });
            it('reducer should return the new state', () => {
                expect(replace.reducer('foo', 'bar')).toEqual('bar');
            });
        });

        describe('reset', () => {
            const { reset } = DEFAULT_PRIMITIVE_BEHAVIORS;
            it('reducer should return the initial state', () => {
                expect(reset.reducer('foo', undefined, 'bar')).toEqual('bar');
            });
        })
        
    });

});