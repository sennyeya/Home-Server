import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
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

// Dark/Light mode.
const useStyles = createUseStyles(ThemeSettings)

/**
 * Main entry point for the application, sets up the router.
 * @param {Object} props 
 */
export default function App(props){
  /** Dark/Light mode state. */
  const [value, setValue] = React.useState('dark');

  /** Loading state, true if ip is registered and user profile has been received. */
  const [loading, setLoading] = React.useState(true);

  /** Gets logged in user profile, null if not logged in. */
  const [loggedIn, setLoggedIn] = React.useState(null);

  /** Error state, set if the secondary IP register server fails. */
  const [error, setError] = React.useState(false);

  let classes = useStyles();

  /**
   * Toggle for setting theme.
   */
  const updateValue = ()=>{
    let updated;
    if(value==='dark'){
      setValue('light')
      updated = 'light'
    }else{
      setValue('dark')
      updated = 'dark'
    }
    setStyle(updated)
  }

  /**
   * Updates the document body(background) with the corresponding mode theme.
   * @param {String} theme 'dark'/'light' modes
   */
  const setStyle = (theme) =>{
    for(let val of Object.keys(ThemeSettings[theme])){
      document.body.style[val] = ThemeSettings[theme][val];
    }
  }

  /**
   * Registers IP, and then gets the current user.
   */
  useEffect(()=>{
    // Need to register ip for local use when using CORS and cookie authentication.
    fetch('http://192.168.0.33:4001/register_ip').then(e=>{
      // Get user.
      API.getRoute("/","/is_auth").then(e=>{
        setStyle(value)
        setLoggedIn(e)
        setLoading(false);
      }).catch(e=>{
        setLoggedIn(null);
        setLoading(false);
      })
    }).catch(e=>{
      setError(true)
    })
  }, []);

  // Updates the array of media with possible newer data on disk.
  const updateCache = () =>{
    API.get("/reset_cache")
  }

  // Returns main router. Will redirect to login page if user is not authenticated. Defaults to hiding nav bar while loading.
  return (
    <ThemeContext.Provider value={{theme:value,toggleTheme:updateValue}}>
      <ThemeContext.Consumer>
        {({theme,toggleTheme})=>
        <div style={{...ThemeSettings[theme], height:"100%"}} className={classes[theme]}>
          {error?<p>Make sure your server is running.</p>:(
          <Router>
            {
              loading? <Loading/>:(
                <MenuBar update={updateCache} toggle={toggleTheme} user={loggedIn}/>
                )}
                <div className="content-container">
                  <Switch>
                    <Route exact path="/">
                      <HomePage/> 
                    </Route>
                    <Route path="/mediaGallery">
                        <MediaGallery />
                    </Route>
                    <Route path="/dashboard">
                      <HomePage/>
                    </Route>
                    <Route path="/media">
                      <Media path={window.location.pathname.replace("/media/","")}/>
                    </Route>
                    <Route path="/login">
                      <Login setLoggedIn={setLoggedIn} user={loggedIn}/>
                    </Route>
                    <Route path="/upload">
                      <Upload/>
                    </Route>
                  </Switch>
                </div>
              </Router>
              )}
              </div>
            }
        </ThemeContext.Consumer>
    </ThemeContext.Provider>
  )
}