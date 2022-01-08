import React, { useEffect } from 'react';
import API from '../API';
import {LoadingIndicator} from '../shared/Loading'
import VideoPlayer from './VideoPlayer'
import ImageViewer from './ImageViewer';
import Playlist from '../shared/Playlist';
import RecommendedContent from '../shared/RecommendedContent';
import Comments from "../shared/Comments.jsx";
import TabSelect from '../shared/TabSelect';


export default function Media(props) {
  /** Loading state. */
  const [loading, setLoading] = React.useState(true);

  /** 
   * Current media data. 
   * @param {String} this.path path to media for server side serving.
  */
  const [data, setData] = React.useState({path:props.path});

  const playlist = window.location.search.indexOf("playlist")!==-1?window.location.search.substring(1)
                    .split("&").filter(e=>e.indexOf("playlist=")!==-1)[0]
                    .split("=")[1]:null;

  /** Load data on page load. */
  useEffect(()=>{
    API.get(`data/${data.path}/`).then(e=>{
      setData(e);
      setLoading(false);
      document.title = e.data.name + " | HomeServer";
    })
  }, [])

  return (
    <>
      <div style={{padding:"4% 0"}}>
        {
          loading? <LoadingIndicator/> :(
              <>{(
                  data.video 
                  ?
                  <VideoPlayer path={data.path} data={data.data}/>
                  :
                  <ImageViewer data={data.data} path={data.path}/>
                  )}
              
              </>)
        }
        {playlist?
          <Playlist id={playlist}
                    current={data.path}/>
          :<></>}
      </div>
      <TabSelect tabs={["recommended", "comments"]} 
                  initialTab={"recommended"}
                  content={[<RecommendedContent id={data.path}/>, <Comments media={data.path}/>]}
      />
    </>
  )
}