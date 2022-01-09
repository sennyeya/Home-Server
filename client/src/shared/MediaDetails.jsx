import React from 'react'
import TimeDisplay from '../shared/TimeDisplay';
import ViewCounter from '../shared/ViewCounter';
import LikeBar from '../shared/LikeBar';
import ViewIncrement from '../shared/ViewIncrement'

export default function MediaDetails({data, id, video}){
    let hours = 0;
    let minutes = Math.floor((+data.duration)/60);
    let seconds = Math.round((+data.duration)%60);
    return (
        <div className="thumbnail-details">
            <ViewIncrement id={id}/>
            <div style={{display: 'flex', justifyContent:"space-between"}}>
                <a>{data.title}</a>
                {
                    video
                    ?
                    <TimeDisplay hours={hours} minutes={minutes} seconds={seconds}/>
                    :<></>
                }
            </div>
            <div style={{display: 'flex', justifyContent:"space-between"}}>
                <ViewCounter views={data.views}/>
                <LikeBar likes={data.likes} dislikes={data.dislikes}/>
            </div>
        </div>
    )
}