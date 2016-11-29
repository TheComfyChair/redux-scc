//@flow
export type ObjectReducerAction = {
    type: string,
    payload?: any,
};
export type ObjectReducerFactory = (structure: Object) => ObjectReducer;
export type ObjectReducer = (state: Object, action: ObjectReducerAction) => Object;


export function objectReducer(): ObjectReducer {
    return (state = {}, { type, payload } = {}) => {
        switch (type) {
            case 'BLARG!':
                return { state, ...payload };
            default:
                return state;
        }
    }
}

