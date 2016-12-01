import { buildReducers } from './redux-arg/generateReducer';
import { createStore, compose } from 'redux';
import { Types } from './redux-arg/constants';

const example = {
    form2: Types.reducer(Types.shape({
        lowerLevel: Types.number,
        lowerLevel2: Types.string,
    })),
    form3: Types.reducer({
        example2: Types.reducer(Types.shape({
            lowerLevel3: Types.string,
        })),
        example3: Types.reducer({
            example4: Types.reducer(Types.shape({
                test: Types.string,
            })),
            example5: Types.reducer({
                test: Types.reducer(Types.shape({
                    blarg: Types.number,
                }))
            })
        })
    }),
};

const test = buildReducers(example);

createStore(
    test,
    compose(window.devToolsExtension ? window.devToolsExtension() : f => f)
);



