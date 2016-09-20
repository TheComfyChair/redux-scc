//@flow
import React from 'react';
import styles from './options.scss';

type OptionsProps = {
    numberOfShells: number,
    shuffles: number,
    onInputChange: (event: Object) => void,
};

export const Options = (props: OptionsProps) => (
    <div>
        <div className={ styles.input }>
            <label htmlFor="numberOfShells">Number of shells: </label>
            <select
                name="numberOfShells"
                value={ props.numberOfShells }
                onChange={ props.onInputChange }
            >
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
            </select>
        </div>
        <div className={ styles.input }>
            <label htmlFor="shuffles">Number of shuffles: </label>
            <select
                name="shuffles"
                value={ props.shuffles }
                onChange={ props.onInputChange }
            >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={7}>7</option>
            </select>
        </div>
    </div>
);
