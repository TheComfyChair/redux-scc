//@flow

import React, { Component } from 'react';
import {
    createRandomNumberFn,
    createShells,
    randomizeArrayOrder,
} from '../utils/gameUtils';
import { Game } from './Game';

//=====================
// Flow types
//=====================
type GameContainerState = {
    ballShellId: number,
    shells: Shell[],
    output: string,
    shuffleCount: number,
    shuffled: boolean,
    shuffling: boolean,
    inProgress: boolean,
};

type GameContainerProps = {
    numberOfShells: number,
    shuffles: number,
};

type Shell = {
    id: number,
};

//======================
// Game component
//======================
export class GameContainer extends Component {
    state: GameContainerState;
    props: GameContainerProps;
    selectRandomShell: ?() => number;
    _initializeGame: (numberOfShells: number) => void;
    _startGame: () => void;
    _setWinningShell: () => void;
    _shellClickHandler: (shellId: number) => void;
    _shuffleShells: () => Promise<boolean>;

    constructor() {
        super();
        this.state = {
            ballShellId: 0,
            shells: [],
            inProgress: false,
            shuffleCount: 0,
            shuffled: false,
            shuffling: false,
            output: `Click on 'Play' to begin!`,
        };
        this.selectRandomShell = null;

        //In general it's a good idea to bind methods which refer to this in the
        //constructor. It means, amongst other things, that the functions can be
        //used as direct event handlers rather than wrapping them in a function.
        this._initializeGame = this._initializeGame.bind(this);
        this._startGame = this._startGame.bind(this);
        this._setWinningShell = this._setWinningShell.bind(this);
        this._shellClickHandler = this._shellClickHandler.bind(this);
        this._shuffleShells = this._shuffleShells.bind(this);
    }

    _initializeGame(numberOfShells: number): void {
        //This is designed to initialize the game whenever the component first mounts, or
        //whenever a new set of options are passed in via props.
        this.setState({
            ballShellId: 0,
            shells: createShells(numberOfShells),
            output: `Click on 'Play' to begin!`,
            shuffleCount: 0,
            shuffling: false,
            shuffled: false,
            inProgress: false,
        });
        this.selectRandomShell = createRandomNumberFn(0, numberOfShells - 1);
    }

    _startGame(): void {
        this._setWinningShell();
        this.setState({
            inProgress: true,
            shuffleCount: 0,
            output: 'Keep an eye on the ball!',
            shuffling: false,
            shuffled: false,
        });
        setTimeout(() => this._shuffleShells().then(() =>
            this.setState({
                output: 'Pick a shell!',
            })), 1000);
    }

    _setWinningShell(): void {
        if (!this.selectRandomShell) throw new Error('selectRandomShell not properly initialized!');
        this.setState({
            ballShellId: this.selectRandomShell(),
        });
    }

    _shellClickHandler(shellId: number): void {
        //We only need to check if the shell is a winning shell if it is in progress and has been shuffled
        if (!this.state.inProgress) return this.setState({ output: `Click on 'Play' to begin!`});
        if (this.state.shuffling) return this.setState({ output: `Have patience, young padawan`});
        this.setState({
            output: this.state.ballShellId === shellId ? `You won! Click 'Play' to play again` : `Better luck next time! Click 'Play' to play again`,
            inProgress: false,
            shuffled: false,
        });
    }

    _shuffleShells(): Promise<boolean> {
        //Shuffle the shells in a time based loop (the animation functionality uses springs, so there's no strict timer
        //on how long the animation plays for).
        this.setState({
            shuffling: true,
            output: 'Shuffling...',
        });

        //Return a promise as this is an async operation
        return new Promise(res => {
            const shuffle = () => {
                const shuffleCount = this.state.shuffleCount + 1;
                this.setState({
                    shells: randomizeArrayOrder(this.state.shells),
                    shuffled: shuffleCount == this.props.shuffles,
                    shuffleCount,
                    shuffling: shuffleCount < this.props.shuffles,
                });
                if (this.state.shuffled) return res(true);
                return setTimeout(shuffle, 1000);
            };
            setTimeout(shuffle, 1000);
        });

    }

    componentWillMount() {
        this._initializeGame(this.props.numberOfShells);
    }

    componentWillReceiveProps(newProps: GameContainerProps) {
        if(newProps.numberOfShells !== this.props.numberOfShells) {
            this._initializeGame(newProps.numberOfShells);
        }
    }

    render() {
        return (
            <Game
                shells={ this.state.shells }
                output={ this.state.output }
                ballShellId={ this.state.ballShellId }
                inProgress={ this.state.inProgress }
                shuffling={ this.state.shuffling }
                shuffled={ this.state.shuffled }
                shellClickHandler={ this._shellClickHandler }
                startGameClickHandler={ this._startGame }
            />
        );
    }
}

