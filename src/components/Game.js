//@flow
import React from 'react';

type Shell = {
    position: number,
}

type GameProps = {
    shells: Shell[],
    shellClickHandler: (id: number) => {},
    shuffleShellsClickHandler: (event: Object) => {},
    startGameClickHandler: (event: Object) => {},
    output: string,
    ballShellId: number,
    inProgress: boolean,
    shuffled: boolean,
}

export const Game = (props: GameProps) => (
    <div>
        { props.shells.map(shell =>
            <div
                key={ shell.id }
                onClick={ () => props.shellClickHandler(shell.id) }
            >
                Hi! I'm a shell! (id { shell.id })
            </div>
        )}
        <button onClick={ props.startGameClickHandler } disabled={ props.inProgress }>Play!</button>
        <button onClick={ props.shuffleShellsClickHandler } disabled={ props.inProgress && props.shuffled || !props.inProgress }>Shuffle!</button>
        <p>{ props.output }</p>
        <p>{ props.ballShellId }</p>
    </div>
);