import React from 'react';

export default function PageCounter(props){
    let {offset, size, length} = props;
    let currentPage = (offset+size)/size;
    let lastPage = (length/size);
    let overage = length===0?size:(offset/length)
    return (
        <div style={{width:"100%", textAlign:"end", fontSize:"16px", fontWeight:"400"}}>
            {
                overage>1
                ?
                <span style={{paddingRight:"2%"}}>Page <b>{Math.ceil(lastPage)}</b> of <b>{Math.ceil(lastPage)}</b></span>
                :
                <span  style={{paddingRight:"2%"}}>Page <b>{currentPage}</b> of <b>{Math.ceil(lastPage)}</b></span>
            }
        </div>
    )
}