//@flow
import React, { Component } from 'react';
import { ShellGameApp } from './ShellGameApp';

type ShellGameAppContainerState = {
    numberOfShells: number,
    shuffles: number,
}

export class ShellGameAppContainer extends Component {
    state: ShellGameAppContainerState;
    _handleInputUpdate: (event: Object) => void;

    constructor() {
        super();
        this.state = {
            numberOfShells: 3,
            shuffles: 5,
        };
        this._handleInputUpdate = this._handleInputUpdate.bind(this);
    }

    //Simple form handler (takes the name and value of an input and adds it to the state if preset).
    _handleInputUpdate(e: Object): void {
        if (!this.state.hasOwnProperty(e.target.name)) throw new Error('Form input name should be on the GameShellAppContainer state');
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    render() {
        return (
            <ShellGameApp
                numberOfShells={ this.state.numberOfShells }
                shuffles={ this.state.shuffles }
                onInputChange={ this._handleInputUpdate }
            />
        )
    }
}
