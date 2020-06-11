import React from 'react';

let billion = 1000000000;
let million = 1000000;
let thousand = 1000

export default function ViewCounter(props) {
    let viewText = "";
    if(props>=billion){
        viewText+=(props.views/billion).toFixed(1)+"B"
    }else if(props>=million){
        viewText+=(props.views/million).toFixed(2)+"M"
    }else if(props>=thousand){
        viewText+=(props.views/thousand).toFixed(3)+"K"
    }else{
        viewText+=props.views || 0
    }
    viewText += props.views!==1?` views`:" view";

  return (
      <>
      <span style={{fontWeight: '400'}}>{viewText}</span>
      </>
  )
}