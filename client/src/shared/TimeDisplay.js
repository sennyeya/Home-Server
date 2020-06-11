import React from 'react';

export default function TimeDisplay(props) {
    let hours = 0;
    let minutes = props.minutes || 0;
    let seconds = props.seconds || 0;
    if(props.seconds>=60){
        minutes+=Math.floor(seconds%60);
        seconds = seconds%60;
    }
    if(minutes>=60){
        hours+=Math.floor(minutes/60);
        minutes = minutes%60;
    }
    hours += props.hour || 0;
  return (
      <>
      <span style={{wordWrap:"normal", overflowWrap:"normal", whiteSpace: "nowrap"}}>
            { 
                (hours?
                (hours+":"+(minutes+"").padStart(2, "0")+":"+(seconds+"").padStart(2, "0")):
                ((minutes+"").padStart(2, "0")+":"+(seconds+"").padStart(2, "0")))
            }
        </span>
      </>
  )
}