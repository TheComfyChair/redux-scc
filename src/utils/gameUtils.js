//@flow
type Shell = {
    id: number,
};
//======================
// Utility functions
//======================
//Generate a random number generator which will return values within a given range.
export function createRandomNumberFn(minimum: number, maximum: number): () => number {
    return () => minimum + Math.floor(Math.random() * ((maximum-minimum) + 1));
}


//Create a randomized array based on an input array.
export function randomizeArrayOrder(array: []): [] {
    let oldArray = [ ...array ];
    let newArr = [];

    while(oldArray.length) {
        newArr = [...newArr, ...oldArray.splice(createRandomNumberFn(0, oldArray.length)(), 1)];
    }

    return newArr;
}


export function createShells(numberOfShells: number): Shell[] {
    /* The shell containing the ball will be tracked independently of shells, but
     in order to properly keep track of components (particularly useful with certain animation libraries),
     a fixed id is desirable. */
    let newShellArr = [];
    for (let i=0; i<numberOfShells; i++) {
        newShellArr = [ ...newShellArr, {
            id: i,
        }];
    }
    return newShellArr;
}
