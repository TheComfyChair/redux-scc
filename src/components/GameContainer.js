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
    inProgress: boolean,
    output: string,
};

type GameContainerProps = {
    numberOfShells: number,
};

type Shell = {
    position: number,
};

//======================
// Game component
//======================
export class GameContainer extends Component {
    state: GameContainerState;
    props: GameContainerProps;

    constructor() {
        super();
        this.state = {
            ballShellId: 0,
            shells: [],
            inProgress: false,
            shuffled: false,
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
        this.setState({
            ballShellId: 0,
            shells: createShells(numberOfShells)
        });
        this.selectRandomShell = createRandomNumberFn(0, numberOfShells - 1);
    }

    _startGame(): void {
        this._setWinningShell();
        this.setState({
            inProgress: true,
            output: `Click a shell to see if you guessed correctly!`
        });
    }

    _setWinningShell(): void {
        if (!this.selectRandomShell) throw new Error('selectRandomShell not properly initialized!');
        this.setState({
            ballShellId: this.selectRandomShell(),
        });
    }

    _shellClickHandler(shellId: number) {
        //We only need to check if the shell is a winning shell if it is in progress and has been shuffled
        if (!this.state.inProgress) return this.setState({ output: `Click on 'Play' to begin!`});
        if (!this.state.shuffled) return this.setState({ output: `Click on 'Shuffle' to shuffle the shells!`});
        this.setState({
            output: this.state.ballShellId === shellId ? `You won! Click 'Play' to play again` : `Better luck next time! Click 'Play' to play again`,
            inProgress: false,
            shuffled: false,
        });
    }

    _shuffleShells() {
        this.setState({
            shells: randomizeArrayOrder(this.state.shells),
            shuffled: true,
        });
    }

    componentWillMount() {
        this._initializeGame(this.props.numberOfShells);
    }

    componentWillReceiveProps(newProps: GameProps) {
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
                shuffled={ this.state.shuffled }
                shellClickHandler={ this._shellClickHandler }
                shuffleShellsClickHandler={ this._shuffleShells }
                startGameClickHandler={ this._startGame }
            />
        );
    }
}

