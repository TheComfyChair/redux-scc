//@flow
type ObjectReducerAction = {
    type: string,
    payload?: Object,
};
type ObjectReducer = (Object) => (Object, ObjectReducerAction) => Object;

export function objectReducer(reducerStructureDescriptor: Object): ObjectReducer {
    const { structure } = reducerStructureDescriptor();
    return (state = determineDefaults(reducerStructureDescriptor)(structure), { type, payload } = {}) => {
        switch (type) {
            case 'BLARG!':
                return { state, ...reducerStructureDescriptor, ...payload };
            default:
                return state;
        }
    }
}

