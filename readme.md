###Redux store chunk creator (redux-scc)

Are you fed up of hand coding the same pattern over and over again? Fed up of conflicting action names causing your button presses to set off your ajax loading animation? Are you a fan of having a strictly defined structure for your redux store, down to the type level? Then redux-scc may be for you!

#### What does it do?
It takes a defined structure and uses a set of 'behaviors' (a small collection of ways that a reducer can
be updated) to create a set of actions and reducer responses that are each linked by a unique string. A set of action
generators, selectors, and reducers are then returned.

The behaviors are purposefully simple, and do much extend beyond basic 
(including shallow merge for object reducers, and index based updates for arrays) 
updating and resetting the store to the initial state.
 
You can then simply put the reducer into the store and being to build your application on top of the action
generators and selectors that have been returned.

#### But these actions are super limited!
That's the point! The actions provided are to be used as a way to send the data over to the reducer for
updating the store (including returning to the initial state). They themselves do not contain business logic. 
Instead, you can take advantage of middleware libraries such as redux-thunks and redux-sagas to perform the necessary logic you need before
finally updating the store using the simple action generators returned.

There are no plans to allow for extensible action behaviors. 

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

The selectors will return the full state of the reducer being referred to. There is currently no way to use a selector to acquire data at a higher level.

The actions are accessed in a similar way, but the available actions are dependant of the type of reducer created:

- primitive (boolean/string/number) reducer: replace, and reset
- shape reducer: update, replace, and reset
- array reducer: replaceAtIndex, resetAtIndex, removeAtIndex, replace, and reset

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
```

The types are roughly divided into two categories: simple types (which do not have any internal structure to deal with), and complex types (which do). The structure of complex types is built up using a combination of objects containing Types, or Types. Examples can be found below.

#### Actions API
##### Primitive/any
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
		example: {
			update: [Function: update] ,
			reset: [Function: reset],
			replace: [Function: replace],
		}
	},
	selectors: {
		example: [Function]
	}
}	

```

> Note that this particular structure, where only one single reducer is being created in a chunk, is subject to change. The resulting object should avoid the unnecessary nesting in the selectors and actions (for object assign/spread reasons, the reducers object is necessary) in the future. 

##### Combining reducers
A more common pattern you may have come across is the idea of combining reducers to more easily manage a certain part of the store. As the individual reducers are independent, it is convenient to be able to update, say, some state of the current screen without any potential impact on the list of users you've grabbed from a server. Redux-scc is designed to handle this, and also any level of arbitrary nesting you'd like!

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
		}
	},
	selectors: {
		screen,
		users,
	}
}	

```

##### Even more nesting!
Here's a quick example of what a nested reducer would look like:

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







