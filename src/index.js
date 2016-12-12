import { buildStoreChunk, Types } from './redux-arg';
import ReactDOM from 'react-dom';
import React from 'react';
import { connect, Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';

function createExampleComponent(initialValue) {

    const name = 'toast-' + Math.floor((Math.random().toFixed(5) * 1e5));

    const storeChunk = buildStoreChunk(
        name,
        {
            toast: Types.reducer(Types.shape({
                foo: Types.string(initialValue),
                bar: Types.string(initialValue),
            })),
        },
    );

    const exampleComponent = props =>
        <div>
            { props.toast.foo }
            <input
                type="text"
                onChange={ props.updateBar }
                value={ props.toast.bar }
            />
            <span onClick={ props.reset }>RESET!</span>
        </div>;

    const exampleComponentContainer = connect(
        state => ({ toast: storeChunk.selectors.toast(state) }),
        dispatch => ({
            updateBar(e) {
                dispatch(storeChunk.actions.toast.update({
                    bar: e.target.value,
                }))
            },
            reset() {
                dispatch(storeChunk.actions.toast.reset())
            }
        })
    )(exampleComponent);

    return {
        ...storeChunk,
        exampleComponentContainer
    }

}

const moduleTest1 = createExampleComponent('toastyFunTimes');
const moduleTest2 = createExampleComponent('moreToastyFunTimes');
const moduleTest3 = createExampleComponent('andAgain');

const store = createStore(combineReducers({
    ...moduleTest1.reducers,
    ...moduleTest2.reducers,
    ...moduleTest3.reducers,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

ReactDOM.render(
    <div>
        <Provider store={ store }>
            <div>
                <p>Testing</p>
                <moduleTest1.exampleComponentContainer/>
                <moduleTest2.exampleComponentContainer/>
                <moduleTest3.exampleComponentContainer/>
            </div>
        </Provider>
    </div>,
    document.getElementById('react-app')
);