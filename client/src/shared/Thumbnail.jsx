import React, {useEffect} from 'react';
import { useAuthOutlet } from '../contexts/AuthorizationContext';
import {LoadingIndicatorOverlay, LoadingIndicator} from './Loading';
import './Thumbnail.css'
import { getMediaDetailLink } from './Utils';


export default function Thumbnail(props) {
    const imageRef = React.createRef();
    const videoPlayerRef = React.createRef();
    const [loading, setLoading] = React.useState(false);
    const [buffering, setBuffering] = React.useState(false);

    const {auth} = useAuthOutlet();

    const fullscreenVideo = (event) =>{
        if(event.target.orientation===90){
            let elem = videoPlayerRef.current;
            if(!elem){
                return;
            }
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
              } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
              } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
              } else if (elem.msRequestFullscreen) { 
                elem.msRequestFullscreen();
              }
        }
    }
    
    useEffect(()=>{
        window.addEventListener('orientationchange', fullscreenVideo)
        return ()=>{
            window.removeEventListener('orientationchange', fullscreenVideo)
        };
    },[])

    const onImageLoad = (e) =>{
        let image = imageRef.current;
        setLoading(false)
        image.style.height = image.height;
        image.style.width = image.width;
    }

    const startPlaying = (e) =>{
        console.log(e.target.readyState)
        if(e.target.readyState<4){
            return setBuffering(true);
        }
        e.target.play();
    }

    const endPlaying = (e) =>{
        if(e.target.readyState<4){
            return setBuffering(false);
        }
        e.target.pause();
    }

    return (
        <>
        <div className="image-wrapper">
            <a href={props.select?undefined:("/media/"+props.path+(props.playlist?`?playlist=${props.playlist}`:""))}>
                {
                    false//!props.video
                    ?
                    <img src={getMediaDetailLink(props.path,"thumbnail", auth.access)} 
                        alt={props.path} ref={imageRef} 
                        className="image-content" 
                        style={loading?{display: "none"}:{}} 
                        onLoad={onImageLoad}/>
                    :
                    <video ref={videoPlayerRef} 
                            src={getMediaDetailLink(props.path,"poster", auth.access)}
                            poster={getMediaDetailLink(props.path,"thumbnail", auth.access)}
                            muted loop
                            onMouseEnter={startPlaying} 
                            onMouseLeave={endPlaying} 
                            id={props.path}
                            onLoadedData={(e)=>{
                                console.log(e)
                                setLoading(false); 
                                setBuffering(true)
                            }}
                            onCanPlayThrough={(e)=>{
                                console.log(e)
                                setBuffering(false); 
                                e.target.className="";
                            }}
                            className={buffering?"video-loading":null}
                            style={loading?{display: "none"}:{}} 
                            onTouchStart={(e)=>props.updatePlaying(e.target)}
                    >{buffering?<LoadingIndicatorOverlay/>:<></>}</video>
                    
                }
                {loading?<LoadingIndicator />:<></>}
                
            </a>
        </div>
        </>
    )
}