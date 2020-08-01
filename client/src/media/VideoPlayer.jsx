import Config from '../config'
import React, { useEffect, useCallback } from 'react';
import API from '../API';
import {LoadingIndicator} from '../shared/Loading';
import MediaDetails from '../shared/MediaDetails';
import Plyr from 'plyr'

/**
 * Video player, handles both server side and in memory videos.
 * @param {*} props 
 */
export default function VideoPlayer({inMemory, blob, path, codec, data}){

    /** Set of user behavior statistics. */
    let [watchStats, setWatchStats] = React.useState([]);

    /** Determine if the video is seeking for start time. */
    let [loading, setLoading] = React.useState(true);

    /** Start time value, collected from server. */
    let [startTime, setStartTime] = React.useState();

    /** Create the new PLYR video player. */
    const upgradeVideo = (player)=>{
        if(player!==null){
            new Plyr(player);
        }
    }

    /** Send watch stats to the server. */
    const sendStats = useCallback((stats) =>{
        if(!inMemory){
            API.post("watch/update", {stats, id: path})
        }
    }, [path, inMemory])

    /** Update the watch state. Upload to API if we just started watching/skipped ahead. */
    const updateViewing = useCallback((e, state) =>{
        if(!inMemory){
            let watched = watchStats.concat({time:e.target.currentTime, state, userTime:Number(new Date())})
            if(state==="seeked"){
                sendStats(watched)
                setWatchStats([])
            }else{
                setWatchStats(watched)
            }
        }
    }, [inMemory, watchStats, sendStats])

    /** Set the last updated time. */
    const setTimeStamp = (e) =>{
        e.target.currentTime = startTime
    }

    /** Set up server upload on page unload and get the last watched time. */
    useEffect(()=>{
        // Try to send data on page unload as well.
        const triggerSend = () =>{
            sendStats(watchStats)
        }

        window.addEventListener("beforeupload", triggerSend)
        return () =>{
            window.removeEventListener("beforeunload", triggerSend)
        }
    }, [watchStats, sendStats])

    useEffect(()=>{
        // Get the last watched time.
        if(!inMemory){
            setLoading(true)
            API.get("watch/last_watched", {id:path}).then(e=>{
                setStartTime(e.time)
                setLoading(false)
            }).catch(e=>{
                setStartTime(0);
                setLoading(false)
            })
        }else{
            setLoading(false)
        }
    }, [path, inMemory])


    /** Upload the watch stats after a certain tolerance. */
    useEffect(()=>{
        if(watchStats.length>=5){
            sendStats(watchStats)
            setWatchStats([])
        }
    }, [watchStats, sendStats])

    return (
        <>
        {loading?<LoadingIndicator/>:
        (!inMemory||(inMemory&&blob)?
        <>
            <video controls 
                    ref={upgradeVideo}
                    onTimeUpdate={(e)=>updateViewing(e, "regular")} 
                    onPlaying={(e)=>updateViewing(e, "playing")} 
                    onWaiting={(e) => updateViewing(e, "waiting")} 
                    onStalled={(e)=>updateViewing(e, "stalled")}
                    onSeeked={e=>updateViewing(e, "seeked")}
                    onLoadedMetadata={setTimeStamp}>
                <source src={inMemory? blob: (Config.api+"storage/"+path)} type={inMemory?codec:"video/mp4"}/>
            </video>
        {inMemory?<></>:<MediaDetails data={data} id={path}/>}</>:<></>)}
        </>
    )
}