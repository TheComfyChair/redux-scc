//@flow

//======================
// Utility functions
//======================
export function createRandomNumberFn(minimum: number, maximum: number): () => number {
    return () => minimum + Math.floor(Math.random() * ((maximum-minimum) + 1));
}

export function randomizeArrayOrder(array: array): array {
    let oldArray = [ ...array ];
    let newArr = [];

    while(oldArray.length) {
        newArr = [...newArr, ...oldArray.splice(createRandomNumberFn(0, oldArray.length)(), 1)];
    }

    return newArr;
}

export function createShells(numberOfShells: number): Shell[] {
    /* The shell containing the ball will be tracked independently of shells, but
     in order to properly animate the shells later, a fixed id is needed. The position
     will be used to track where the shell should be displayed, with the id
     remaining fixed. */
    let newShellArr = [];
    for (let i=0; i<numberOfShells; i++) {
        newShellArr = [ ...newShellArr, {
            id: i,
        }];
    }
    return newShellArr;
}
