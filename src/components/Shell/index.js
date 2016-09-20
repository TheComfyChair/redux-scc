//@flow
import React from 'react';
import styles from './shell.scss';
import { Motion, spring } from 'react-motion';

type ShellProps = {
    onClick: () => void,
    position: number,
    containsBall: boolean,
    displayBall: boolean,
}

export const Shell = (props: ShellProps) =>
    <Motion style={{x: spring(props.position, { stiffness: 300, damping: 15 })}}>
        { ({ x }) => (
            <div>
                <div
                    style={ {
                        left: x
                    } }
                    className={ styles.shell }
                    onClick={ props.onClick }
                >
                { props.containsBall && props.displayBall &&
                    <div className={ styles.ball } /> }
                </div>
            </div>
        )}
    </Motion>;


