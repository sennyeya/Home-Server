import React, { useEffect } from 'react';
import Grid from './Grid';
import {LoadingIndicator} from './Loading'
import API from '../API';
import './Playlist.css'

export default function Playlist(props){
    let [length, setLength] = React.useState(0);
    let [loading, setLoading] = React.useState(true);
    let [items, setItems] = React.useState([]);
    let [offset, setOffset] = React.useState(0);
    let size = 6;

    useEffect(()=>{
        API.get('user/playlist_items', {id:props.id}).then(e=>{
            setItems(e.items);
            let index = -1;
            for(let elem in e.items){
                if(e.items[elem]._id===props.current){
                    index = elem;
                }
            }
            if(index===-1){
                setOffset(()=>{throw new Error("Playlist item not found")});
            }
            setOffset(Math.floor(index/size)*size);
            setLength(e.length);
            setLoading(false);
        })
    }, [props.id])

    return (
        <div className="playlist-container boxed-content" style={{margin: "2% 0"}}>
            <h2>{props.name}</h2>
            {loading? <LoadingIndicator/>:(
                <div className="playlist-content-container">
                {offset>0?<button onClick={()=>setOffset(offset-size)}>&#x2039;</button>:<></>}
                <Grid items={items.slice(offset, offset+size)} 
                    size={size}
                    highlight
                    selected={[{_id:props.current}]}
                    playlist={props.id}/>
                {offset<length-size?<button onClick={()=>setOffset(offset+size)}>&#x203A;</button>:<></>}
                </div>
            )}
        </div>
    )
}