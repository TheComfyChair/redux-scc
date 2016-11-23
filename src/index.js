import { buildReducers, Types } from './redux-arg/generateReducer';
import { createStore, compose } from 'redux';

const example = {
    form2: Types.reducer({
        lowerLevel: Types.number,
        lowerLevel2: Types.string,
    }),
    form3: Types.reducer({
        example2: Types.reducer({
            lowerLevel3: Types.string,
        }),
        example3: Types.reducer({
            example4: Types.reducer({
                test: Types.string,
            }),
            example5: Types.reducer({
                test: Types.reducer({
                    blarg: Types.number,
                })
            })
        })
    })
};

const test = buildReducers(example);
console.log(333, test);

createStore(
    test,
    compose(window.devToolsExtension ? window.devToolsExtension() : f => f)
);



