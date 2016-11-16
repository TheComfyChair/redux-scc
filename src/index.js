import { generateReducer } from './redux-arg/generateReducer';
import { createStore, compose } from 'redux';

const config = {
    anObject: {
        lowerLevelStuff: '',
        moreLowerLevelStuff: '',
    },
    anotherObject: {
        more: '',
        andAgain: '',
    },
};

createStore(
    generateReducer(config),
    compose(window.devToolsExtension ? window.devToolsExtension() : f => f)
);



