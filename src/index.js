import { buildStoreChunk } from './redux-arg/buildStoreChunk';
import { createStore, compose, combineReducers } from 'redux';
import { Types } from './redux-arg/structure';

const exampleReducer = {
    example: Types.reducer({
        form2: Types.reducer(Types.shape({
            lowerLevel: Types.number(5),
            lowerLevel2: Types.string('Blargle'),
            lowerLevelArray: Types.arrayOf(Types.string(), ['foo', 'bar', 'toast']),
            nested: Types.shape({
                lowerLevel3: Types.number(),
            })
        })),
        form3: Types.reducer({
            example2: Types.reducer(Types.shape({
                lowerLevel3: Types.string(),
            })),
            example3: Types.reducer({
                example4: Types.reducer(Types.shape({
                    test: Types.string(),
                })),
                example5: Types.reducer({
                    test: Types.reducer(Types.shape({
                        blarg: Types.number(),
                    }))
                })
            })
        }),
        arrayTest: Types.reducer(Types.arrayOf(
            Types.number(),
            [1,3,4]
        )),
        primitiveTest: Types.reducer(Types.number(4)),
    })
};

const test = buildStoreChunk('example', exampleReducer);

const store = createStore(
    combineReducers({
        ...test.reducers,
    }),
    compose(window.devToolsExtension ? window.devToolsExtension() : f => f)
);

store.dispatch(test.actions.example.form2.replace({ lowerLevel: 2, lowerLevel2: 'Rawrg', lowerLevelArray: [3, 'foo'] }));
store.dispatch(test.actions.example.form2.reset());
store.dispatch(test.actions.example.form2.replace({ toast: 'nommyNom' }));
store.dispatch(test.actions.example.form2.reset());

console.log(111, test.selectors.example.form2(store.getState()));
console.log(222, test.actions);
console.log(333, test.selectors);
console.log(444, test.selectors.example.primitiveTest(store.getState()));

store.dispatch(test.actions.example.arrayTest.replace([1,2,3]));
store.dispatch(test.actions.example.arrayTest.updateAtIndex(5, 0));
store.dispatch(test.actions.example.arrayTest.updateAtIndex('foo', 0));

store.dispatch(test.actions.example.primitiveTest.replace(5));
store.dispatch(test.actions.example.primitiveTest.reset());
