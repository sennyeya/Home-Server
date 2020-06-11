import React from 'react';
import {Link} from 'react-router-dom'
import './MenuBar.css';
import Settings from './Settings'

export default function MenuBar(props) {

  return (
    <div className="wrapper">
      <nav>
        <div className="appleNav">
          <ul>
            {
              props.user?(
                <>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  <Link to="/mediaGallery">Media</Link>
                </li>
                <li>
                  <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/upload">Upload</Link>
                </li>
                <li>
                  <a onClick={props.update} style={{cursor:"pointer"}} href="#">Update Media</a>
                </li>
                </>)
                :<></>}
                <li>
                  <div className="menu-settings">
                    <Settings toggle={props.toggle} user={props.user}/>
                  </div>
                </li>
          </ul>
        </div>
      </nav>
    </div>
  )
         
}