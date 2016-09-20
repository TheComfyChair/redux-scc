//@flow
import React from 'react';
import { GameContainer } from './GameContainer';

type ShellGameAppProps = {
    numberOfShells: number,
    onInputChange: (event: Object) => {},
};

export const ShellGameApp = (props: ShellGameAppProps) => (
    <div>
        <GameContainer numberOfShells={ props.numberOfShells } />
        <div>
            <label htmlFor="numberOfShells">Number of shells: </label>
            <select
                name="numberOfShells"
                value={ props.numberOfShells }
                onChange={ props.onInputChange }
            >
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </div>
    </div>
);
