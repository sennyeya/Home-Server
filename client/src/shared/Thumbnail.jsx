import React, {useEffect} from 'react';
import Config from '../config';
import {LoadingIndicator} from './Loading';
import './Thumbnail.css'

export default function Thumbnail(props) {
    const imageRef = React.createRef();
    const videoPlayerRef = React.createRef();
    const [loading, setLoading] = React.useState(false);

    const fullscreenVideo = (event) =>{
        if(event.target.orientation===90){
            let elem = videoPlayerRef.current;
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

    const onImageLoad = () =>{
        let image = imageRef.current;
        setLoading(false)
        image.style.height = image.height;
        image.style.width = image.width;
    }

    const startPlaying = (e) =>{
        if(e.target.readyState<1){
            return;
        }
        e.target.play();
    }

    const endPlaying = (e) =>{
        if(e.target.readyState<1){
            return;
        }
        e.target.pause();
    }

    return (
        <>
        <div className="image-wrapper">
            <a href={"/media/"+encodeURI(props.path)}>
                {
                    !props.video
                    ?
                    <img src={Config.api+"thumbnails/"+encodeURI(props.path)} 
                        alt={props.path} ref={imageRef} 
                        className="image-content" 
                        style={loading?{display: "none"}:{}} 
                        onLoad={onImageLoad}/>
                    :
                    <video ref={videoPlayerRef} 
                            src={Config.api+"thumbnails/"+encodeURI(props.path)} 
                            poster={Config.api+"poster/"+encodeURI(props.path)} 
                            muted loop 
                            onMouseEnter={startPlaying} 
                            onMouseLeave={endPlaying} 
                            onTouchStart={(e)=>props.updatePlaying(e.target)}
                    ></video>
                    
                }
                {loading?<LoadingIndicator centered={true}/>:<></>}
                
            </a>
        </div>
        </>
    )
}