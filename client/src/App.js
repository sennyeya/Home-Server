import React, { useEffect, useContext, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.css';
import {ThemeContext, ThemeSettings } from './contexts/ThemeContext'
import Media from './media/Media';
import Login from './routes/Login';
import Loading from './shared/Loading';
import Upload from './routes/Upload';
import {createUseStyles} from 'react-jss';
import MediaGallery from './media/MediaGallery'
import MenuBar from './menu/MenuBar';
import HomePage from './routes/Homepage'
import Dashboard from './routes/Dashboard';
import CreatePlaylist from './routes/CreatePlaylist';
import MessageLogger from './shared/MessageLogger';
import PlaylistGallery from './routes/PlaylistGallery';
import { useUserOutlet } from './contexts/UserContext';
import { useApiOutlet } from './contexts/ApiContext';

// Dark/Light mode.
const useStyles = createUseStyles(ThemeSettings)

/**
 * Main entry point for the application, sets up the router.
 * @param {Object} props 
 */
export default function App(props){
  /** Loading state, true if ip is registered and user profile has been received. */
  const [loading, setLoading] = React.useState(true);
  const {user} = useUserOutlet()

  useEffect(()=>{
    if(user) setLoading(false)
  }, [user, setLoading])

  let classes = useStyles();

  let {theme} = useContext(ThemeContext)

  // Returns main router. Will redirect to login page if user is not authenticated. Defaults to hiding nav bar while loading.
  return (
    <div>
      <head>
        <link rel="stylesheet" href="https://cdn.plyr.io/3.6.2/plyr.css" />
      </head>
      <Router>
        {
      loading? <Loading/>:(
        <MenuBar/>
        )}
        <div style={{...ThemeSettings[theme], minHeight:"95vh"}} className={classes[theme]}>
            <div className="content-container">
              <MessageLogger/>
              <div className="content">
                <Switch>
                  <Route exact path="/">
                    <HomePage/>
                  </Route>
                  <Route path="/mediaGallery">
                    <MediaGallery/>
                  </Route>
                  <Route path="/dashboard">
                    <Dashboard/>
                  </Route>
                  <Route path="/media">
                    <Media path={window.location.pathname.replace("/media/","")}/>
                  </Route>
                  <Route path="/login">
                    <Login/>
                  </Route>
                  <Route path="/upload">
                    <Upload/>
                  </Route>
                  <Route path="/create_playlist">
                    <CreatePlaylist/>
                  </Route>
                  <Route path="/playlists">
                    <PlaylistGallery/>
                  </Route>
                </Switch>
              </div>
            </div>
          </div>
        </Router>
    </div>
  )
}