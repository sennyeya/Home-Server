import React from 'react';
import ToggleSlider from './ToggleSlider'
import './CustomInputs.css'

export function CustomCheckmark(props){
    let checked;
    if(props.checked instanceof String){
        checked = props.checked==="true";
    }else{
        checked = props.checked
    }
    return (
        <>
            <ToggleSlider update={(e)=>props.update(e)} cond={checked}/>
        </>
        
    )
}