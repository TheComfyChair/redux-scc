//@flow
//==============================
// Flow imports
//==============================
import type { StructureType, PrimitiveType } from './structure';
import type { PartialStoreChunk } from './reducers';

//==============================
// JS imports
//==============================
import { combineReducers } from 'redux';
import { reduce, find, omit, isFunction } from 'lodash';
import { compose } from 'ramda';
import { createReducer } from './reducers';
import { PROP_TYPES } from './structure';

// Build a chunk of the eventual store. The selectors and actions
// generated will specifically operate on the store chunk generated. Selectors will be
// relative to the baseSelector provided or, if not specified, the root of the store, using
// the name of the chunk as the base property.

export function buildStoreChunk(name: string, structure: any, {
    baseSelector = state => state[name],
    locationString = '',
}: {
    baseSelector: any,
    locationString: string,
} = {}): PartialStoreChunk {
    if (!structure) throw new Error(`The structure must be defined for a reducer! LocationString: ${ locationString }`);
    const initialMemo: PartialStoreChunk = {
        reducers: {
            [name]: {},
        },
        actions: {},
        selectors: {},
        baseSelector,
        locationString,
        name,
    };
    //Build up the reducers, actions, and selectors for this level. Due to recursion,
    //these objects will be assigned to a property in the parent object, or simply
    //returned to the call site for use in the rest of the application.

    //If the reducer's structure is a function (and, therefore, not nested reducers), we can skip the reduce.
    if (isFunction(structure)) return combineStoreChunkReducers(processStructure(initialMemo, structure, name));
    return combineStoreChunkReducers(reduce(structure, processStructure, initialMemo));
}

export function combineStoreChunkReducers(processedStoreChunk: PartialStoreChunk) {
    //The Redux 'combineReducers' helper function is used here to save a little bit of boilerplate.
    //This helper, if you're not aware, ensures that the correct store properties are passed to the
    //reducers assigned to those properties.
    return { ...omit(processedStoreChunk, ['baseSelector', 'locationString', 'name']), reducers: {
        [processedStoreChunk.name]: combineReducers(processedStoreChunk.reducers)
    }};
}

export function processStructure(memo: PartialStoreChunk, propValue: StructureType | PrimitiveType, propName: string) {
    //Get the structure from the propValue. In the case of 'StructureType' properties, this
    //will be some form of shape (or primitives in the case of arrays). At this point we
    //are only interested in whether or not the structure contains reducers, as that
    //has an impact on how we proceed with regards to calls.
    const { structure: propStructure } = propValue();
    const containsReducers = !!find(propStructure, v => v().type === PROP_TYPES._reducer);

    //Create the child reducer. Depending on whether or not the current structure level contains
    //child reducers, we will either recursively call reducerBuilder, or we will call the
    //createReducer function, which will create the correct reducer for the given structure
    //(which can be either object, array, or primitive).
    let childReducer = containsReducers
        ?   buildStoreChunk(propName, propStructure, {
                locationString: memo.locationString ? `${memo.locationString}.${propName}` : propName,
                baseSelector: (state: any) => memo.baseSelector(state)[propName],
            })
        :   createReducer(propValue, {
                locationString: `${memo.locationString}.${propName}`,
                name: propName,
            });

    //As the chunk is built up, we want to assign the reducers/actions created
    //by the child to a location on the reducers/actions object which will match up
    //to their location. Selectors are created at this level, as the child does not
    //need to know where it is located within the grand scheme of things.
    return {
        ...memo,
        reducers: {
            ...memo.reducers,
            ...childReducer.reducers
        },
        actions: {
            ...memo.actions,
            [propName]: childReducer.actions,
        },
        selectors: {
            ...memo.selectors,
            [propName]: containsReducers ? childReducer.selectors : state => memo.baseSelector(state)[propName],
        },
    };
}









