//@flow
import type { ShapeStructure } from '../structure';

export type PrimitiveReducerAction = {
    type: string,
    payload?: any,
};
export type PrimitiveReducerFactory = (structure: Object) => PrimitiveReducer;
export type PrimitiveReducer = (state: any, action: PrimitiveReducerAction) => any;

export function primitiveReducer<ArrayReducerFactory>(reducerStructureDescriptor: ShapeStructure) {
    return(state: any = '', { type, payload }: PrimitiveReducerAction = {}) => {
        switch(type) {
            case 'BLARG3':
                return payload;
            default:
                return state;
        }
    }
}