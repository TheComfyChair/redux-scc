import {
    buildStoreChunk,
    processStructure,
} from '../buildStoreChunk';
import {
    Types,
} from '../structure';
import {
    createStore,
    combineReducers,
} from 'redux';

describe('buildStoreChunk', () => {
    describe('buildStoreChunk', () => {
        it('Will throw error if a structure is not defined', () => {
            expect(() => buildStoreChunk('toast')).toThrowError(/structure/);
        });
        it('Will accept a single reducer (no nesting)', () => {
            expect(Object.keys(buildStoreChunk('toast',  Types.reducer(Types.string()) )) )
                .toEqual(['reducers', 'actions', 'selectors']);
        });
        it('Will return an object containing reducers, actions, and selectors as the result', () => {
            expect(Object.keys(buildStoreChunk('toast', {
                example: Types.reducer(Types.string()),
            }))).toEqual(['reducers', 'actions', 'selectors']);
        });

        describe('Resulting chunk', () => {
            const chunk = buildStoreChunk('example', {
                nested1: Types.reducer(Types.string('foo')),
                nested2: Types.reducer(Types.shape()),
                nested3: Types.reducer(Types.arrayOf(Types.number())),
                nested4: Types.reducer({
                    innerNested1: Types.reducer(Types.string('bar')),
                    innerNested2: Types.reducer({
                        innerNested3: Types.reducer(Types.string('baz')),
                    }),
                }),
            });
            const nonNestedChunk = buildStoreChunk('example2', Types.reducer(Types.string('foo')));

            describe('Selectors', () => {
                const store = createStore(combineReducers({
                    ...chunk.reducers,
                }));

                it('Selectors object has the correct top level structure for a nested chunk', () => {
                    expect(Object.keys(chunk.selectors)).toEqual(['nested1', 'nested2', 'nested3', 'nested4']);
                });
                it('Selectors object has the correct top level structure for a non nested chunk', () => {
                    expect(Object.keys(nonNestedChunk.selectors)).toEqual(['example2']);
                });
                it('Nested selectors object has the correct structure for a defined reducer', () => {
                    expect(Object.keys(chunk.selectors.nested4)).toEqual(['innerNested1', 'innerNested2']);
                });
                it('Selector returns correct value', () => {
                    expect(chunk.selectors.nested1(store.getState())).toEqual('foo');
                });
                it('Nested selector returns correct value', () => {
                    expect(chunk.selectors.nested4.innerNested1(store.getState())).toEqual('bar');
                });
            });

            describe('Actions', () => {
                it('Actions object has the correct top level structure for a nested chunk', () => {
                    expect(Object.keys(chunk.actions)).toEqual(['nested1', 'nested2', 'nested3', 'nested4']);
                });
                it('Actions object has the correct top level structure for a non nested chunk', () => {
                    expect(Object.keys(nonNestedChunk.actions)).toEqual(['example2']);
                });
                it('Nested actions object has the correct structure for a chunk', () => {
                    expect(Object.keys(chunk.actions.nested4)).toEqual(['innerNested1', 'innerNested2']);
                });
                it('Replace actions return an object that contains a type and payload', () => {
                    expect(Object.keys(chunk.actions.nested1.replace('bar'))).toEqual(['type', 'payload']);
                    expect(Object.keys(chunk.actions.nested2.replace({}))).toEqual(['type', 'payload']);
                    expect(Object.keys(chunk.actions.nested3.replace([]))).toEqual(['type', 'payload', 'index']);
                });
            });

            describe('Combined actions and selectors (nested chunk)', () => {
                const store = createStore(combineReducers({
                    ...chunk.reducers,
                    ...nonNestedChunk.reducers,
                }));

                it('Dispatching an action should correctly update the store', () => {
                    store.dispatch(chunk.actions.nested1.replace('bar'));
                    expect(chunk.selectors.nested1(store.getState())).toEqual('bar');

                    store.dispatch(chunk.actions.nested1.reset());
                    expect(chunk.selectors.nested1(store.getState())).toEqual('foo');
                });
            });

            describe('Combined actions and selectors (non nested chunk)', () => {
                const store = createStore(combineReducers({
                    ...chunk.reducers,
                    ...nonNestedChunk.reducers,
                }));

                it('Dispatching an action should correctly update the store', () => {
                    store.dispatch(nonNestedChunk.actions.example2.replace('bar'));
                    expect(nonNestedChunk.selectors.example2(store.getState())).toEqual('bar');

                    store.dispatch(nonNestedChunk.actions.example2.reset());
                    expect(nonNestedChunk.selectors.example2(store.getState())).toEqual('foo');
                });
            });

        });

    });

    describe('processStructure', () => {

    });
});
