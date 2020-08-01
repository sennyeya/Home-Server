import React, { useEffect, useContext, useCallback } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './App.css';
import ThemeContext, { ThemeSettings } from './contexts/ThemeContext'
import Media from './media/Media';
import API from './API'
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
import ErrorBoundary from './ErrorBoundary'
import {useMessageOutlet} from './contexts/MessagingContext'
import { useUserOutlet } from './contexts/UserContext';

// Dark/Light mode.
const useStyles = createUseStyles(ThemeSettings)

/**
 * Main entry point for the application, sets up the router.
 * @param {Object} props 
 */
export default function App(props){
  /** Loading state, true if ip is registered and user profile has been received. */
  const [loading, setLoading] = React.useState(true);

  let classes = useStyles();

  let setMessage = useMessageOutlet();

  let setUser = useUserOutlet();

  let {theme} = useContext(ThemeContext)

  /**
   * Registers IP, and then gets the current user.
   */
  useEffect(()=>{
    /** Check if the user is logged in. */
    const getLoggedInState = () =>{
      API.getRoute("/","/is_auth").then(e=>{
        setUser(e.user);
        setLoading(false);
      }).catch(e=>{
        setUser(null);
        setLoading(false);
      })
    }

    /** 
     * Assert that the IP registration server is up and running, 
     * this is only needed when accessing locally, ie with IP addresses.
     */
    const registerIp = () =>{
      fetch('http://192.168.0.33:4001/register_ip').then(e=>{
        // Get user.
        getLoggedInState();
      }).catch(e=>{
        setMessage(new Error("Make sure your IP registration server is running!"))
        setTimeout(registerIp, 30000)
      });
    }
    // Need to register ip for local use when using CORS and cookie authentication.
    registerIp();
  }, []);

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
              <ErrorBoundary>
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
              </ErrorBoundary>
            </div>
          </div>
        </Router>
      </div>
  )
}