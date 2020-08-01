import React, { useEffect } from 'react';
import Thumbnail from './Thumbnail';
import TimeDisplay from './TimeDisplay';
import ViewCounter from './ViewCounter';
import LikeBar from './LikeBar';
import './Grid.css'

export default function Grid(props){
    const [playing, setPlaying] = React.useState(null)

    const updatePlaying = (newPlayer) =>{
        console.log(newPlayer.readyState)
        
        if(playing === newPlayer){
            if(playing.readyState<4){
                playing.className= "video-loading";
            }else{
                playing.currentTime = 0;
                playing.className = ""
                playing.play();
            }
            return;
        }

        if(playing){
            if(playing.className==="video-loading"){
                playing.className = ""
            }else{
                playing.pause();
            }
        }
        if(newPlayer.readyState<4){
            newPlayer.className= "video-loading";
        }else{
            newPlayer.className = ""
            newPlayer.play();
        }
        setPlaying(newPlayer);
    }

    return (
        <div className="content-grid" style={{justifyContent:(props.center?"center":"")}}>
            {props.items.map((e,i)=>{
                return (
                    <GridItem size={props.size} 
                    data={e} 
                    key={i} 
                    updatePlaying={updatePlaying} 
                    select={props.select} 
                    update={props.update}
                    highlight={props.highlight}
                    selected={props.selected}
                    playlist={props.playlist}/>
                )
            })}
        </div>
    )
}

function GridItem({select, highlight, selected, data, playlist, updatePlaying, update, size}) {
    let [width] = React.useState("120");
    let [height] = React.useState("120");
    let [isSelected, setIsSelected] = React.useState(false);

    const updateSelected = () =>{
        if(select){
            setIsSelected(!isSelected);
        }
    }

    useEffect(()=>{
        if(select || highlight){
            setIsSelected(selected.some(e=>e._id===data._id))
        }
    }, [data, highlight, selected, select])

    useEffect(()=>{
        if(select){
            if(selected){
                update(selected.concat(data))
            }else{
                update(selected.filter(e=>e._id!==data._id))
            }
        }
    }, [selected, update, select, data])

    let extraStyle = {};
    if(isSelected){
        extraStyle["borderWidth"] = ".5%";
        extraStyle["borderColor"] = "yellow";
        extraStyle["borderStyle"] = "solid"
    }

    return (
        <>
        <div className="content-item" style={{flexBasis:((100/size)-(isSelected?4:3))+"%", ...extraStyle}} 
                onMouseDown={updateSelected}>
            <Thumbnail width={width} 
                        height={height} 
                        path={data._id} 
                        video={data.video} 
                        updatePlaying={updatePlaying}
                        select={select}
                        playlist={playlist}/>
            <ItemDetail video={data.video} 
                        data={data}
                        select={select}
                        playlist={playlist}/>
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
                <a href={props.select?undefined:("/media/"+data._id+(props.playlist?`?playlist=${props.playlist}`:""))}>
                    {data.name.replace(data.format,"")}
                </a>
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