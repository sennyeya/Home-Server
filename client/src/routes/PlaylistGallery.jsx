import React, { useEffect } from 'react';
import { LoadingIndicator } from '../shared/Loading';
import Playlist from '../shared/Playlist';
import API from '../API'

/**
 * Show the set of user playlists.
 */
export default function PlaylistGallery(){
    let [loading, setLoading] = React.useState(true)
    let [playlists, setPlaylists] = React.useState([])

    /** Load this user's playlists when component loads. */
    useEffect(()=>{
        API.get('user/playlists').then(e=>{
            setPlaylists(e);
            setLoading(false);
        })
    }, [])

    return (
        <div className="playlist-gallery-container">
            <h1>Playlists</h1>
            {loading?<LoadingIndicator/>:(
                <>
                {
                    playlists.map((e,i)=><Playlist key ={i} name={e.name} id={e.id}/>)
                } 
                <button onClick={()=>window.location.href="/create_playlist"}>
                    Make {playlists.length?"another":"one"}
                </button></>
            )}
        </div>
    )
}