import React, { useEffect } from 'react';
import Grid from '../shared/Grid';
import API from '../API';
import Loading from '../shared/Loading';
import {ButtonSeeMore} from '../shared/Buttons'

export default function HomePage(props) {
    let [videoLoading, setVideoLoading] = React.useState(true)
    let [imageLoading, setImageLoading] = React.useState(true)
    let [images, setImages] = React.useState([])
    let [videos, setVideos] = React.useState([])
    useEffect(()=>{
        API.get("media_gallery",{offset:0, image:true}).then(e=>{
            setImages(e.media);
            setImageLoading(false)
        }).catch(err=>{
            console.log(err)
        })

        API.get("media_gallery",{offset:0, video:true}).then(e=>{
            setVideos(e.media);
            setVideoLoading(false)
        }).catch(err=>{
            console.log(err)
        })
    }, [])

    return (
        <>
            <div className="content-div">
                <h1>Images</h1>
                {
                    imageLoading
                    ?
                    <Loading/>
                    :
                    <Grid items={images}/>
                }
                </div>

                {<ButtonSeeMore url={"mediaGallery?image=true"}/>}

            <div className="content-div">
                <h1>Videos</h1>
                {
                    videoLoading
                    ?
                    <Loading/>
                    :
                    <Grid items={videos}/>
                }
            </div>

            {<ButtonSeeMore url={"mediaGallery?video=true"}/>}
        </>
    )
}