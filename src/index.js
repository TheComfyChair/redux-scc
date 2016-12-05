import { buildReducers } from './redux-arg/buildReducers';
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

const exampleReducer2 = {
    screen: Types.reducer(Types.shape({
        handlerIsCBS: Types.boolean(true),
        handlerIsENG: Types.boolean(true),
        invoices: Types.arrayOf(Types.string()),
        activeInvoice: Types.number(-1),
        deleteInvoiceModalActive: Types.boolean(),
        suppInvoiceModalActive: Types.boolean(),
        paymentModalActive: Types.boolean(),
        resetModalActive: Types.boolean(),
        reinstateModalActive: Types.boolean(),
    })),
    delete: Types.reducer(Types.shape({
        invoiceSequence: Types.number(),
        vehicleSequence: Types.number(),
        deleteReason: Types.string(),
    })),
    supp: Types.reducer(Types.shape({
        invoiceSequence: Types.number(),
        vehicleSequence: Types.number(),
        mode: Types.string(),
        amount: Types.string(),
    })),
};

const test = buildReducers('example', exampleReducer);
const test2 = buildReducers('invoices', exampleReducer2);

const store = createStore(
    combineReducers({
        ...test.reducers,
        ...test2.reducers,
    }),
    compose(window.devToolsExtension ? window.devToolsExtension() : f => f)
);

store.dispatch(test.actions.example.form2.update({ lowerLevel: 2, lowerLevel2: 'Rawrg', lowerLevelArray: [3, 'foo'] }));
store.dispatch(test.actions.example.form2.reset());
store.dispatch(test.actions.example.form2.replace({ toast: 'nommyNom' }));
store.dispatch(test.actions.example.form2.reset());

console.log(111, test.selectors.example.form2(store.getState()));
console.log(222, test.actions);
console.log(333, test.selectors);
console.log(444, test.selectors.example.primitiveTest(store.getState()));
console.log(555, test2.selectors, test2.actions);
console.log(666, test2.selectors.screen(store.getState()));

store.dispatch(test.actions.example.arrayTest.replace([1,2,3]));
store.dispatch(test.actions.example.arrayTest.updateAtIndex(5, 0));
store.dispatch(test.actions.example.arrayTest.updateAtIndex('foo', 0));

store.dispatch(test.actions.example.primitiveTest.update(5));
store.dispatch(test.actions.example.primitiveTest.reset());
