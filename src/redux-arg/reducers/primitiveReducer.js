//@flow
type Primitive = string | number;
type PrimitiveReducerAction = {
    type: string,
    payload?: string | number,
};
type PrimitiveReducer = (Primitive) => (Primitive, PrimitiveReducerAction) => Primitive;

export function primitiveReducer(reducerStructureDescriptor): PrimitiveReducer {
    const { structure } = reducerStructureDescriptor();
    return (state = determineDefaults(reducerStructureDescriptor)(structure), { type, payload } = {}) => {
        switch(type) {
            case 'BLARG2':
                return { state, ...structure, ...payload };
            default:
                return state;
        }
    }
}
