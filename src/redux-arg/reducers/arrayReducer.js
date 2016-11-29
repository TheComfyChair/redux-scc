//@flow
import type { ReducerStructure } from '../structure';

export type ArrayReducerAction = {
    type: string,
    payload?: any[],
    index?: number,
};
export type ArrayReducerFactory = (structure: Object) => ArrayReducer;
export type ArrayReducer = (state: any[], action: ArrayReducerAction) => any[];

export function arrayReducer<ArrayReducerFactory>(reducerStructureDescriptor: ReducerStructure) {
    return(state: any[] = [], { type, payload = []}: ArrayReducerAction = {}): any[] => {
        switch(type) {
            case 'BLARG3':
                return [ state, ...payload ];
            default:
                return state;
        }
    }
}
