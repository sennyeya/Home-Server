import React, { useEffect } from 'react';
import './Buttons.css'

/**
 * Simple forward/backward buttons.
 * @param {{offset:any,size:Number, updateDir:Function, update:Function, length:Number}} props 
 * @param {any} props.offset current offset in the overall array of content.
 * @param {Number} props.size how many media items should be skipped.
 * @param {Function} props.updateDir parent element method to update direction user has clicked.
 * @param {Function} props.update parent element method to update offset.
 * @param {Number} props.length length of content array.
 */
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

/**
 * See more button.
 * @param {{url:String}} props 
 * @param {String} url where to redirect the user on click.
 */
export function ButtonSeeMore(props){
    return (
        <div className="button-grid">
            <button onClick={()=>window.location.href = props.url}>
                More
            </button>
        </div>
    )
}

/**
 * Numbered pages for easier navigation.
 * @param {{offset:any, size:Number, length:Number, update:Function}} props 
 * @param {any} offset current user offset.
 * @param {Number} size size of the gallery.
 * @param {Number} length total length of the content array.
 * @param {Function} update update offset in the parent element.
 */
export function NumberedPages({offset, size, length, update}){
    const [buttons, setButtons] = React.useState([])
    const [currentPage, setCurrentPage] = React.useState(1)
    useEffect(()=>{
        let numButtons = 5;
        let overflow = false;
        let buttons = [];
        let currentPage = +(+offset/size).toFixed(0)+1
        let lastPage = Math.ceil(length/size);

        // Will we have more than a set number of buttons?
        if(length/size > numButtons){
            overflow = true
        }

        // If yes, only add a small subset of possible buttons.
        if(overflow){
            if(currentPage===lastPage){
                buttons.push(1, "...", currentPage-3, currentPage-2, currentPage-1)
            }else{
                if(currentPage===1){
                    buttons.push(currentPage+1, currentPage+2, currentPage+3, "...", lastPage)
                }else{
                    if(currentPage===lastPage-1){
                        buttons.push(1, "...", currentPage -2, currentPage-1, lastPage)
                    }else{
                        if(currentPage===2){
                            buttons.push(1, "...", currentPage+1, "...", lastPage)
                        }else{
                            buttons.push(1, "...", currentPage-1, currentPage+1, "...", lastPage)
                        }
                    }
                }
            }
        // Otherwise, add all possible buttons.
        }else{
            if(currentPage===lastPage){
                let incPage = lastPage;
                while(incPage>0){
                    incPage--;
                    buttons.unshift(incPage)
                }
            }else if(lastPage!==0){
                let incPage = currentPage===0?currentPage+1:currentPage-1;
                while(incPage<=lastPage){
                    buttons.push(incPage)
                    incPage++;
                }
            }else{
                
            }
        }
        setButtons(buttons)
        setCurrentPage(currentPage)
    }, [length, size, offset]);

    /** Prompts the user if they choose to navigate to a specific page from '...' option. */
    const promptUser = () =>{
        let response = window.prompt("What page do you want to go to?", currentPage+1);
        if(!isNaN(response)){
            update(size*(+response-1));
        }
    }

    return (
    <div className="button-grid">
        {buttons.map((e, i)=>{
            if(isNaN(e)){
                return <button key={i} onClick={promptUser}>{e}</button>
            }
            return (
                <button key={i} onClick={()=>{update((e-1)*size)}}>{e}</button>
            )
        })}
    </div>
    )
}