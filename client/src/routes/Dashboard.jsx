import React, { useEffect, useContext } from 'react'
import BlurredContent from '../shared/BlurredContent'
import { LoadingIndicator } from '../shared/Loading'
import Gallery from '../shared/Gallery';
import MessagingContext, { useMessageOutlet } from '../contexts/MessagingContext'
import './Dashboard.css';
import API from '../API'
import UserContext from '../contexts/UserContext';

/**
 * '/dashboard'
 * User dashboard route, shows playlists and viewed content. 
 */
export default function Dashboard(props){
    const {user} = useContext(UserContext)

    /** Do not load anything if the user is not logged in. */
    if(!user){
        return (
            <div style={{height:"80vh", width:"100%"}}>
                <BlurredContent overlay={<></>}/>
            </div>
        )
    }
    return (
        <div className="profile-container">
            <div className="profile-information">
                <h1>Hello, {user.username}</h1>
                <span></span>
            </div>
            <div className='profile-recently-watched boxed-content'>
                <Viewed/>
            </div>
            <div className="profile-playlists boxed-content">
                <PlaylistList/>
            </div>
        </div>
    )
}

/**
 * Set of playlists. Only shows top 3.
 */
function PlaylistList(){
    /** Set of playlists from API. */
    let [playlists, setPlaylists] = React.useState([]);

    /** Loading state. */
    let [loading, setLoading] = React.useState(true);

    /** Error state. */
    let [error, setError] = React.useState("");

    const setMessage = useMessageOutlet();

    /** Return the list of playlists from the API. */
    const getPlaylists = () =>{
        API.get("user/playlists").then(e=>{
            setPlaylists(e);
            setError("")
            setLoading(false)
        }).catch(e=>{
            setError(e)
            setLoading(false)
            setTimeout(()=>{
                setLoading(true);
            }, 30000)
        })
    }

    /** Update message agent on error. */
    useEffect(()=>{
        if(error){
            setMessage(new Error(error.message))
        }
    }, [error, setMessage])

    /** Load the playlists initially. */
    useEffect(()=>{
        if(loading){
            getPlaylists();
        }
    }, [loading])

    return (
        <div className="playlist-container">
            <h2>Playlists</h2>
            {loading?<LoadingIndicator/>:<>{playlists.length?playlists.map((e, i)=>{
                return (
                    <div className="playlist-item" key={i}>
                        <h2>{e.name}</h2>
                        <Gallery items={e.items.slice(0, 2)} gridSize={1} playlist={e.id}/>
                    </div>
                )
            }):<p style={{textAlign:"center"}}>No playlists yet.</p>}</>}
            <button onClick={()=>window.location.href="/create_playlist"}>Make {playlists.length?"another":"one"}</button>
        </div>
    )
}

/**
 * Set of viewed content. Only shows top 20.
 */
function Viewed(){

    /** Set of recently viewed media. */
    let [viewed, setViewed] = React.useState([]);

    /** Loading state. */
    let [loading, setLoading] = React.useState(true);

    /** Error state. */
    let [error, setError] = React.useState("");
    
    const { setMessage } = useContext(MessagingContext)

    /** Get viewed content from API. */
    const getViewedContent = () =>{
        API.get("user/viewed").then(e=>{
            setViewed(e);
            setError("")
            setLoading(false)
        }).catch(e=>{
            setError(e)
            setLoading(false);
            setTimeout(()=>{
                setLoading(true);
            }, 30000)
        })
    }

    /** Update viewed content when loading. */
    useEffect(()=>{
        if(loading){
            getViewedContent();
        }
    }, [loading])

    /** Update message agent on error. */
    useEffect(()=>{
        if(error){
            setMessage(error.message)
        }
    }, [error, setMessage])

    return (
        <div className="viewed-container">
            <h2>Recently Viewed</h2>
            {loading?<LoadingIndicator/>:<>{<Gallery items={viewed} gridSize={3}/>}</>}
        </div>
    )
}