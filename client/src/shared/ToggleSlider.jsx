import React from 'react'

export default function ToggleSlider(props){

    return (
            <label className="switch">
                <input type="checkbox" checked={props.cond} onChange={(e)=>{console.log(e.target.checked);props.update(e.target.checked)}}/>
                <span className="slider round"></span>
            </label>)
}