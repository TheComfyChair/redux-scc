//@flow
import type { ReducerStructure } from '../structure';

export type ObjectReducerAction = {
    type: string,
    payload?: Object,
};
export type ObjectReducerFactory = (structure: Object) => ObjectReducer;
export type ObjectReducer = (state: Object, action: ObjectReducerAction) => Object;

export function arrayReducer<ArrayReducerFactory>(reducerStructureDescriptor: ReducerStructure) {
    return(state: Object = calculateDefaults(reducerSructure), { type, payload = {}}: ObjectReducerAction = {}): Object => {
        switch(type) {
            case 'BLARG3':
                return [ state, ...payload ];
            default:
                return state;
        }
    }
}
