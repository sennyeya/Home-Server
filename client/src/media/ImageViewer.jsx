import React from 'react';
import MediaDetails from '../shared/MediaDetails';
import Config from '../config'

/**
 * Access image based media.
 * @param {String} props.path media id to get media from.
 * @param {Boolean} props.inMemory loading image from a blob.
 * @param {Blob} props.blob blob data to load image from.
 */
export default function(props){
    if(props.inMemory&&!props.blob){
        return <></>
    }
    return (
        <>
            <img className="image-content" src={props.inMemory?props.blob:(Config.api+"storage/"+props.path)} alt="Image Content"/>
            {props.inMemory?<></>:<MediaDetails data={props.data} id={props.path}/>}
        </>
    )
}