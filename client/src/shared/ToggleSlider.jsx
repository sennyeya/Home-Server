import React from 'react'

export default function ToggleSlider(props){
    return (
            <label className="switch">
                <input type="checkbox" 
                        checked={props.cond} 
                        onChange={(e)=>props.update(e.target.checked?props.val1:props.val2)}
                />
                <span className="slider round"></span>
            </label>)
}