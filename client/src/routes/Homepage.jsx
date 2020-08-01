import React, { useEffect, useContext } from 'react';
import Grid from '../shared/Grid';
import API from '../API';
import {LoadingIndicator} from '../shared/Loading';
import {ButtonSeeMore} from '../shared/Buttons';
import './Homepage.css'
import BlurredContent from '../shared/BlurredContent';
import UserContext from '../contexts/UserContext';

/**
 * Displays the default home page for the user. Blurs out content if user not logged in.
 */
export default function HomePage(props) {
    const {user} = useContext(UserContext)

    return (
        <>
            <h1>Images</h1>
            <div className="boxed-content">
                <LoggedInContent retrieve={API.get} endpoint={"media_gallery"} params={{offset:0, image:true}}/>
                {!user?<></>:<ButtonSeeMore url={"mediaGallery?image=true"}/>}
            </div>

            <h1>Videos</h1>
            <div className="boxed-content">
                <LoggedInContent retrieve={API.get} endpoint={"media_gallery"} params={{offset:0, video:true}}/>
                {!user?<></>:<ButtonSeeMore url={"mediaGallery?video=true"}/>}
            </div>
        </>
    )
}

/** 
 * Display the user grid, either blurred if not logged in or all elements if logged in.
 * @param {{retrieve:Function, loading: Boolean, error:String}} *
 * @param {Function} retrieve function to retrieve media items.
 * @param {Boolean} loading loading state.
 * @param {String} error error state.
 */
function LoggedInContent({retrieve, endpoint, params}){
    /** Loading state. */
    const [loading, setLoading] = React.useState(true);

    /** Items to display. */
    const [items, setItems] = React.useState([]);

    /** Error state. */
    const [error, setError] = React.useState("");

    const {user} = useContext(UserContext)

    /** Load data on loading update. */
    useEffect(()=>{
        if(loading){
            retrieve(endpoint, params).then(data=>{
                setItems(data.media);
                setLoading(false);
            }).catch(err=>{
                setError(err.message);
                setLoading(false);
                setTimeout(()=>setLoading(true), 30000)
            })
        }
    }, [loading, retrieve, endpoint, params])

    

    return (
        <>{
            user
            ?(
                loading
                ?
                <LoadingIndicator/>
                :
                (
                    error
                    ?
                    <p style={{textAlign: 'center', color:'red'}}>Error: {error}</p>
                    :
                    <Grid items={items} size={4}/>
                )
            )
            :
            <div style={{height:"20vh", width:"100%"}}>
                <BlurredContent 
                        overlay={
                        <>
                            You're not logged in. 
                            <button onClick={()=>window.location.href='/login'}>Login</button>
                        </>}
                />
            </div>
        }</>
    )
}