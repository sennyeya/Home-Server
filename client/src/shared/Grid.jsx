import React from 'react';
import Thumbnail from './Thumbnail';
import TimeDisplay from './TimeDisplay';
import ViewCounter from './ViewCounter';
import LikeBar from './LikeBar';
import './Grid.css'

export default function Grid(props){
    const [playing, setPlaying] = React.useState(null)

    const updatePlaying = (newPlayer) =>{
        if(playing === newPlayer){
            playing.pause();
            playing.currentTime = 0;
            playing.play();
            return;
        }

        if(playing){
            playing.pause()
        }
        newPlayer.play();
        setPlaying(newPlayer);
    }

    return (
        <div className="content-grid">
            {props.items.map((e,i)=>{
                return (
                    <GridItem data={e} key={i} updatePlaying={updatePlaying}/>
                )
            })}
        </div>
    )
}

function GridItem(props) {
    let [width] = React.useState(1000);
    let [height] = React.useState(1000);

    return (
        <>
        <div className="content-item">
            <Thumbnail width={width} height={height} path={props.data._id} video={props.data.video} updatePlaying={props.updatePlaying}/>
            <ItemDetail video={props.data.video} data={props.data}/>
        </div>
        </>
    )
}

function ItemDetail(props){
    let {data} = props;
    let hours = 0;
    let minutes = Math.floor((+data.duration)/60);
    let seconds = Math.round((+data.duration)%60);
    return (
        <div className="thumbnail-details">
            <div style={{display: 'flex', justifyContent:"space-between"}}>
                <a href={"media/"+data._id}>{data.name.replace(data.format,"")}</a>
                {
                    props.video
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