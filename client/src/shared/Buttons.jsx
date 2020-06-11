import React from 'react';
import './Buttons.css'

export function ButtonNextBack(props){
    let size = "50%"
    return (
        <div className="button-grid">
            {+props.offset>=props.size?
                <button className="button-item" 
                    style={{flexBasis:size}} 
                    onClick={()=>{
                        if(props.updateDir){
                            props.updateDir("backward")
                        }
                        props.update(
                            props.offset>props.length
                            ?
                            (props.length-props.length%props.size)
                            :
                            (-props.size+(+props.offset)))}
                    }>Back</button>:<></>}
            {(+props.offset+props.size<props.length)?
                <button className="button-item" 
                    style={{flexBasis: size}} 
                    onClick={()=>{
                        if(props.updateDir){
                            props.updateDir("forward");
                        }
                        props.update(props.size+(+props.offset))}
                }>Next</button>:<></>}
        </div>
    )
}

export function ButtonSeeMore(props){
    return (
        <div className="button-grid">
            <button onClick={()=>window.location.href = props.url}>
                More
            </button>
        </div>
    )
}