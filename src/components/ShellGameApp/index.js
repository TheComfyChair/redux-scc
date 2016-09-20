//@flow
import React from 'react';
import { GameContainer } from '../GameContainer';
import { Options } from '../Options';
import styles from './shellGameApp.scss';

type ShellGameAppProps = {
    numberOfShells: number,
    shuffles: number,
    onInputChange: (event: Object) => void,
};

export const ShellGameApp = (props: ShellGameAppProps) => (
    <div className={ styles.app }>
        <h1>The game of shells</h1>
        <GameContainer
            numberOfShells={ props.numberOfShells }
            shuffles={ props.shuffles }
        />
        <Options
            numberOfShells={ props.numberOfShells }
            shuffles={ props.shuffles }
            onInputChange={ props.onInputChange }
        />
        <p className={ styles.info }>Built using React, and React-motion for the shuffling animations.</p>
    </div>
);
