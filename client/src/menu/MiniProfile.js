import React, { useEffect, useContext } from 'react';
import config from '../config';
import './MiniProfile.css'
import { Link } from 'react-router-dom';
import API from '../API';
import link from '../resources/launch-24px.svg'
import UserContext from '../contexts/UserContext';

/**
 * Profile picture menu for access to user specific pages.
 * @param {{update:Function}} props 
 * @param props.update updates the title of the page when a value is pressed.
 */
export default function MiniProfile(props) {
    /** Logged in user from context. */
    const {user} = useContext(UserContext)

    /** Is menu popup open? */
    const [popupOpen, setPopupOpen] = React.useState(false);

    /** Logout user, from API. */
    const logout = () =>{
        API.getRoute('/','/logout').then(e=>{
          window.location.reload();
        })
      }

      /** Closes modal when the click is not from inside the menu. */
    const closeModalOnIrrelevantClick = (e) =>{
        if(!e.target.closest(".popup-container")&& !e.target.closest(".profile-icon")){
            setPopupOpen(false)
        }
    }
    
    useEffect(()=>{
        window.addEventListener('click', closeModalOnIrrelevantClick)

        return ()=>{
            window.removeEventListener('click', closeModalOnIrrelevantClick)
        }
    }, [])

    return (
        <>
            {
                user?
                    (
                        <>
                        <button className="profile-icon" onClick={()=>setPopupOpen(!popupOpen)}>
                            <img className="profile-image" src={user.image || config.publicApi+(user.username?user.username.substring(0, 1):"default")+".jpeg"} alt={"Open Profile Menu"}/>
                        </button>
                        
                        <div className={"popup-container"+(popupOpen?" active":"")}>
                            <span>Hi, {user.username}</span>
                            <div className="popup-item first" onClick={()=>{props.update("Dashboard");window.location.href="/dashboard"; setPopupOpen(false)}}>
                                <Link to="/dashboard">Dashboard</Link>
                                <a href="/dashboard" title="Go to Dashboard">
                                    <img src={link} className="color-glyph" style={{width:"24px", height:"24px"}} alt={"Go to Dashboard"}/>
                                </a>
                            </div>
                            <div className="popup-item last" onClick={()=>{props.update("Playlists"); window.location.href="/playlists"; setPopupOpen(false)}}>
                                <Link to="/playlists">Playlists</Link>
                                <a href="/playlists" title="Go to Playlists">
                                    <img src={link} className="color-glyph" style={{width:"24px", height:"24px"}} alt={"Go to Playlists"}/>
                                </a>
                            </div>
                            <button onClick={logout}>Logout</button>
                        </div>
                        </>
                    )
                :
                <></>

            }
        </>
    )
}