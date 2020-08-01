import React, {useEffect} from 'react';
import Config from '../config';
import {LoadingIndicatorOverlay, LoadingIndicator} from './Loading';
import './Thumbnail.css'

export default function Thumbnail(props) {
    const imageRef = React.createRef();
    const videoPlayerRef = React.createRef();
    const [loading, setLoading] = React.useState(true);
    const [buffering, setBuffering] = React.useState(false);

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
                    !props.video
                    ?
                    <img src={Config.api+"thumbnails/"+props.path} 
                        alt={props.path} ref={imageRef} 
                        className="image-content" 
                        style={loading?{display: "none"}:{}} 
                        onLoad={onImageLoad}/>
                    :
                    <video ref={videoPlayerRef} 
                            src={Config.api+"thumbnails/"+props.path}
                            poster={Config.api+"poster/"+props.path}
                            muted loop 
                            onMouseEnter={startPlaying} 
                            onMouseLeave={endPlaying} 
                            id={props.path}
                            onLoadedData={(e)=>{setLoading(false); setBuffering(true)}}
                            onCanPlayThrough={(e)=>{setBuffering(false); e.target.className="";}}
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