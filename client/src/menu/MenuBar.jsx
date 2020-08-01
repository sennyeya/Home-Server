import React, { useEffect, useContext } from 'react';
import {Link} from 'react-router-dom'
import './MenuBar.css';
import Settings from './Settings';
import menu from '../resources/menu-24px.svg'

import MiniProfile from './MiniProfile'
import UserContext from '../contexts/UserContext';

const links = {
  '/mediaGallery':'Media',
  "/upload":"Upload",
  '/playlists':'Playlists',
  '/':'Home'
}

export default function MenuBar(props) {
  let {user} = useContext(UserContext)
  const [selected, setSelected] = React.useState(user?"Home":"Login");

  const toggleMenu = () =>{
    if(document.getElementById("menu").className === "active"){
      document.getElementById("menu").className = "";
    }else{
      document.getElementById("menu").className = "active"
    }
  }

  useEffect(()=>{
    document.title = selected + " | HomeServer";
    if (/Mobi|Android/i.test(navigator.userAgent)){
      toggleMenu()
    }
  }, [selected])

  useEffect(()=>{
    if(user){
      setSelected(links[window.location.pathname])
    }
    if (/Mobi|Android/i.test(navigator.userAgent)){
      toggleMenu()
    }
  }, [user])

  return (
    <div className="sticky-menu">
      <div className="mobile-menu">
            <img src={menu} alt={"Expand Menu"} onClick={()=> toggleMenu()} className="color-glyph" style={{width:"24px", height:"24px"}}/>
      </div>
      <nav id="menu" className="active">
        <div className="appleNav">
          <ul>
            {
              user?(
                <>
                <li>
                  <Link to="/" onClick={()=>setSelected("Home")} className={selected==="Home"?"selected":null}>Home</Link>
                </li>
                <li>
                  <Link to="/mediaGallery" onClick={()=>setSelected("Media")} className={selected==="Media"?"selected":null}>Media</Link>
                </li>
                <li>
                  <Link to="/upload" onClick={()=>setSelected("Upload")} className={selected==="Upload"?"selected":null}>Upload</Link>
                </li>
                </>)
                :<>
                  <li>
                    <Link to="/login" onClick={()=>setSelected("Login")} className={selected==="Login"?"selected":null}>Login</Link>
                  </li>
                </>}
                <li>
                  <div className="menu-settings">
                    <Settings/>
                  </div>
                </li>
          </ul>
        </div>
      </nav>
      <div className="profile-menu-container">
          <MiniProfile update={setSelected}/>
      </div>
    </div>
  )
         
}