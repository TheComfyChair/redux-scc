//@flow
import React from 'react';
import { Shell as ShellComponent } from '../Shell';
import styles from './game.scss';

type Shell = {
    id: number,
}

type GameProps = {
    shells: Shell[],
    shellClickHandler: (id: number) => void,
    startGameClickHandler: () => void,
    output: string,
    ballShellId: number,
    inProgress: boolean,
    shuffled: boolean,
}

type onClick = (event: Object) => void

export const Game = (props: GameProps) => (
    <div>
        <div className={ styles.board } style={{ width: 10 + (props.shells.length * 110) }}>
            { props.shells.map((shell, idx) =>
                <ShellComponent
                    key={ shell.id }
                    onClick={ () => props.shellClickHandler(shell.id) }
                    position={ 10 + (idx * 110) }
                    containsBall={ props.ballShellId === shell.id }
                    displayBall={ !props.shuffling && !props.shuffled }
                />
            )}
        </div>
        <button
            className={ styles.play }
            onClick={ props.startGameClickHandler }
            disabled={ props.inProgress }
        >
            Play!
        </button>
        <p className={ styles.output }>{ props.output }</p>
    </div>
);
