### Redux store chunk creator (redux-scc)

[![Build Status](https://travis-ci.org/TheComfyChair/redux-scc.svg?branch=master)](https://travis-ci.org/TheComfyChair/redux-scc)
[![Coverage Status](https://coveralls.io/repos/github/TheComfyChair/redux-scc/badge.svg?branch=master)](https://coveralls.io/github/TheComfyChair/redux-scc?branch=master)

Are you fed up of hand coding the same pattern over and over again? Fed up of conflicting action names causing your button presses to set off your ajax loading animation? Are you a fan of having a strictly defined structure for your redux store, down to the type level? Then redux-scc may be for you!

### Installing
Install via yarn or npm:

```
yarn add redux-scc
```

#### What does it do?
It takes a defined structure and uses a set of 'behaviors' (a small collection of ways that a reducer can
be updated) to create a set of actions and reducer responses. A selector is also created for every reducer defined, and the set of action generators, selectors, and reducers are then returned.

The behaviors are purposefully simple, and do not do much extend beyond basic updating and resetting the store to the initial state. There are a couple of helper actions to make your life easier (shallow update for object, pop/push for arrays), but the main goal of this library is to produce a simple, dependable, basis for you to build complex functionality on top of, rather than tackle such functionality itself. If you think of redux-scc reducers as a very crude database, with actions providing a limited set of ways to interact and selectors providing simple queries, then you'll be in a great place to start taking advantage of it!
 
You can then simply put the reducer into the store and being to build your application on top of the action
generators and selectors that have been returned.

#### How to use it

To use redux-scc you need to be aware of two things: The buildStoreChunk() function, and the Types object.

##### buildStoreChunk
```
buildStoreChunk(name: string, structure: ReducerType | {}, options: {
  baseSelector: Selector = state => state[name],
  locationString: string = name
}
``` 
buildStoreChunk takes a name and a structure (more on that later) and will return an object with the properties reducers, actions, and selectors.

The reducers property is simple! It is an object with the top level properties matching up to the top level of the structure you defined. You simply assign/spread that object into your top level store and away you go!

The actions and selectors object follow the defined structure and will contain actions and selectors, respectively, at the leaves of the structure.

The selectors will return the full state of their specific reducer.

The actions are accessed in a similar way, but the available actions are dependant of the type of reducer created:

- primitive (boolean/string/number) reducer: replace, and reset
- shape reducer: update, replace, and reset
- array reducer: replaceAtIndex, resetAtIndex, removeAtIndex, replace, reset, push, pop, shift, unshift

##### Types
Types are the building blocks of the structure, and should be fairly familiar to you if you're used to using React's PropTypes. At the moment, redux-scc offers a cut down version of the various PropTypes:

```
//Simple
Types.string(defaultValue = '')
Types.number(defaultValue = 0)
Types.boolean(defaultValue = false)


//Complex
Types.arrayOf(structure, defaultValue = [])
Types.reducer(structure)
Types.shape(structure)


//Custom types
Types.custom({
  validator, //(value: any) => boolean
  validationErrorMessage, //(value: any) => string,
})(defaultValue)
```

The types are roughly divided into two categories: simple types (which do not have any internal structure to deal with), and complex types (which do). The structure of complex types is built up using a combination of objects containing Types, or Types. Examples can be found below.
The custom type allows you to define arbitrary validation to be applied, which allows you do anything your heart desires! An example of this may
be to define a type which only accepts objects that are an instance of moment:

```
const momentType = Types.custom({
  validator: value => value instanceof moment,
  validationErrorMessage: value => `${ value } is not an instance of moment!`,
});
```

Or maybe you want to create a type with a maximum accepted value:

```
const maxValueType = (maxValue: number) => Types.custom({
  validator: value => typeof value === 'number' && value < maxValue,
  validationErrorMessage: value => `${ value } must be less than ${ maxValue }`,
});
```

Like all other types, you can also use a custom type to create a reducer. 

#### Actions API
##### Primitive/any/custom
- replace(value: any): Replaces the current reducer value with the value provided.
- reset(): Resets the reducer value to the initial value.

##### Shape
- replace(value: Object): Replaces the current reducer value with the value provided.
- reset(): Resets the reducer value to the initial value.
- update(value: Object): Updates the object (in a shallow fashion), using the object provided.

##### Array
- replace(value: Array<any>): Replaces the array with the array provided.
- reset(): Resets the reducer value to the initial value.
- replaceAtIndex(value: any, index: number): Replace the value for the array element, at the specified index, with the value provided.
- resetAtIndex(value: any, index: number): Reset the value for an array element, at the specified index, with the value provided.
- removeAtIndex(index: number): Remove the element from the array at the specified index.
- push(value: any): Add the value to the end of the array.
- pop(): Remove the last element of the array.
- shift(value: any): Add the value to the beginning of the array.
- unshift(): Remove the first element of the array.

#### Combined actions
Automatically generating these actions is a nice time saver, but an issue with them at the moment is that, if you want to update several parts of the store,
these actions will need to be dispatched individually. This makes 'time travel' in Redux much more difficult, as the
various updates occur individually and cannot easily be rolled back. Additionally, each update will result in redux informing subscribers of
an update! Redux-scc avoids this by providing the `createCombinedAction` utility.

`createCombinedAction` takes a name (so you can easily identify the action in the redux dev tools), and an array of redux-scc actions. These
actions will be performed as part of one redux update, thus avoiding the unfortunate side effects mentioned above.
 
```
const anExampleCombinedAction = createCombinedAction({
  name: 'an example!',
  actions: [
    actions.someReduxSccReducer.reset(),
    actions.anotherReduxSccReducer.replace('foo!'),
  ],
});
```

If a reducer is affected by the actions multiple times, the actions will play out sequentially.

```
//We start with the reducer (which is an array type reducer) having state: [4,5,6]

const exampleBatchedUpdateHittingSameReducerMultipleTimes = createCombinedAction({
  name: 'multiple update funsies!',
  actions: [
    actions.removeAtIndex(1), //removes 5 - [4,6]
    actions.replaceAtIndex(23, 1), //replaces 6 with 23 - [4, 23]
    actions.push(43), //adds 43 to the end of the array - [4, 23, 43] 
  ],
});

```

#### resetAll
The special `resetAll` action is available for nested reducers (i.e. those where more than just one reducer has been defined in the chunk). Calling this action allows you to reset all of the reducers in the chunk simultaneously.

```
store.dispatch(actions.resetAll());
```

#### Examples

##### Basic
Here, we're just going to create a very basic store chunk that is one, solitary, shape (i.e. object) reducer.

```
const exampleStoreChunk = buildStoreChunk('example', Types.reducer(Types.shape({
  foo: Types.string(),
  bar: Types.number(),
})));
```

This will return the following object:

```
{
  reducers: { 
    example: [Function: combination]
  },
  actions: {
    update: [Function: update] ,
    reset: [Function: reset],
    replace: [Function: replace],
  },
  selectors: [Function]
}	

```
As we are not creating a nested reducer structure, the actions and selectors returned are not nested either - simply referring to the created reducer directly.

##### Combining reducers
A more common pattern you may have come across is the idea of combining reducers to more easily manage a certain chunk of the store. It allows you to operate on certain data structures without worrying about the impact on other parts of the store. Redux-scc is designed to handle this, up to any level of arbitrary nesting you'd like!

```
const exampleStoreChunk2 = buildStoreChunk('example2', {
	screen: Types.reducer(Types.string()),
	users: Types.reducer(Types.arrayOf(Types.string())),
});		
```

This produces the following object:

```
{
  reducers: { 
    screen,
    users,
  },
  actions: {
    screen: {
      reset,
      replace,
    },
    users: {
      replaceAtIndex,
      resetAtIndex,
      removeAtIndex,
      replace,
      reset,
      pop,
      push,
      shift,
      unshift,
    }
  },
  selectors: {
    screen,
    users,
  }
}	

```

##### Even more nesting!
Above we saw how combined reducers would operate, here's a quick example of what a reducer nested inside another reducer would look like:

```
const exampleStoreChunk2 = buildStoreChunk('example2', {
  screen: Types.reducer({
    someNestedReducer: Types.reducer(Types.string()),
  }),
});
		
```

Producing:

```
{
  reducers: {
    screen, //Contains the combination of all child reducers
  },
  actions: {
    screen: {
      someNestedReducer: {
        reset,
        replace,
      }
    }	
  },
  selectors: {
    screen: {
      someNestedReducer,
    }
  }
}	

```







