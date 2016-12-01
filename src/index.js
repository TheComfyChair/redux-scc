import { buildReducers } from './redux-arg/buildReducers';
import { createStore, compose } from 'redux';
import { Types } from './redux-arg/structure';

const exampleReducer = {
    example: Types.reducer({
        form2: Types.reducer(Types.shape({
            lowerLevel: Types.number(),
            lowerLevel2: Types.string(),
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
    })
};

const test = buildReducers('example', exampleReducer);

const store = createStore(
    test.reducers,
    compose(window.devToolsExtension ? window.devToolsExtension() : f => f)
);

store.dispatch(test.actionsObject.example.form2.update({ lowerLevel: 'nom' }));
store.dispatch(test.actionsObject.example.form2.reset());
store.dispatch(test.actionsObject.example.form2.replace({ toast: 'nommyNom' }));
store.dispatch(test.actionsObject.example.form2.reset());

