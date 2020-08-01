import React from 'react';
import './InputWrapper.css'

export default function Search(props) {

    return (
        <div className="input-container" style={props.style}>
            <div className="input-wrapper">
                {props.children}
            </div>
        </div>
    )
}