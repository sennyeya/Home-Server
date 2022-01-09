import React, { useEffect } from 'react';
import API from '../API';
import {LoadingIndicator} from '../shared/Loading'
import VideoPlayer from './VideoPlayer'
import ImageViewer from './ImageViewer';
import Playlist from '../shared/Playlist';
import RecommendedContent from '../shared/RecommendedContent';
import Comments from "../shared/Comments.jsx";
import TabSelect from '../shared/TabSelect';
import { useApiOutlet } from '../contexts/ApiContext';


export default function Media(props) {
  /** Loading state. */
  const [loading, setLoading] = React.useState(true);

  /** 
   * Current media data. 
   * @param {String} this.path path to media for server side serving.
  */
  const [data, setData] = React.useState({path:props.path});

  const {get} = useApiOutlet();

  const playlist = window.location.search.indexOf("playlist")!==-1?window.location.search.substring(1)
                    .split("&").filter(e=>e.indexOf("playlist=")!==-1)[0]
                    .split("=")[1]:null;

  /** Load data on page load. */
  useEffect(()=>{
    get(`media/${data.path}`).then(e=>{
      console.log(JSON.stringify(e))
      setData(e);
      setLoading(false);
      document.title = e.title + " | HomeServer";
    })
  }, [])

  return (
    <>
      <div style={{padding:"4% 0"}}>
        {
          loading? <LoadingIndicator/> :(
              <>{(
                  true //data.video 
                  ?
                  <VideoPlayer path={data.id} data={data}/>
                  :
                  <ImageViewer data={data} path={data.id}/>
                  )}
              
              </>)
        }
        {playlist?
          <Playlist id={playlist}
                    current={data.id}/>
          :<></>}
      </div>
      <TabSelect tabs={["recommended", "comments"]} 
                  initialTab={"recommended"}
                  content={[<RecommendedContent id={data.id}/>, <Comments media={data.id}/>]}
      />
    </>
  )
}