//@flow
import React, { Component } from 'react';
import { ShellGameApp } from './ShellGameApp';

type ShellGameAppContainerState = {
    numberOfShells: number,
}

export class ShellGameAppContainer extends Component {
    state: ShellGameAppContainerState;

    constructor() {
        super();
        this.state = {
            numberOfShells: 3,
        };

        this._handleInputUpdate = this._handleInputUpdate.bind(this);
    }

    _handleInputUpdate(e) {
        if (!this.state.hasOwnProperty(e.target.name)) throw new Error('Form input name should be on the GameShellAppContainer state');
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    render() {
        return (
            <ShellGameApp
                numberOfShells={ this.state.numberOfShells }
                onInputChange={ this._handleInputUpdate }
            />
        )
    }
}
