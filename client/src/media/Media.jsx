import React, { useEffect } from 'react';
import Config from '../config'
import API from '../API';
import {ButtonNextBack} from '../shared/Buttons';
import {LoadingIndicator} from '../shared/Loading'
import TimeDisplay from '../shared/TimeDisplay';
import ViewCounter from '../shared/ViewCounter';
import LikeBar from '../shared/LikeBar';
import ViewIncrement from '../shared/ViewIncrement'

export default function Media(props) {
  const [offset, setOffset] = React.useState(0);
  const [index, setIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState({path:props.path});
  const [dir, setDir] = React.useState("")
  const [size, setSize] = React.useState(1)

  useEffect(()=>{
    setLoading(true);
    let dirObj = {};
    if(dir==="forward"){
      dirObj = {forward:1}
    }else if(dir==="backward"){
      dirObj = {backward:1}
    }
    API.get(`shift/${data.path}/`, dirObj).then(e=>{
      setData(e);
      setIndex(e.offset);
      setLoading(false);
      document.title = e.data.name;
      if(window.location.pathname.replace("/media/", "")!==e.path){
        window.history.pushState(null, null, e.path)
      }
    })
  }, [offset])

  return (
    <>
      <div style={{padding:"4%"}}>
        {
          loading? <LoadingIndicator/> :(
          <>{(
              data.video 
              ?
              <video controls>
                    <source src={Config.api+"storage/"+data.path} type={"video/mp4"}/>
              </video>
              :
              <img className="image-content" src={Config.api+"storage/"+data.path} alt="Image Content"/>
              )}
          <MediaDetails data={data.data}/>
          <ViewIncrement id={data.path}/>
          </>)
        }
      </div>
      <ButtonNextBack size={size} length={data.length} offset={index} update={setOffset} updateDir={setDir}/>
    </>
  )
}

function MediaDetails(props){
  let {data} = props;
  let hours = 0;
  let minutes = Math.floor((+data.duration)/60);
  let seconds = Math.round((+data.duration)%60);
  return (
    <div className="thumbnail-details">
        <div style={{display: 'flex', justifyContent:"space-between"}}>
            <a>{data.name.replace(data.format,"")}</a>
            {
                props.video
                ?
                <TimeDisplay hours={hours} minutes={minutes} seconds={seconds}/>
                :<></>
            }
        </div>
        <div style={{display: 'flex', justifyContent:"space-between"}}>
            <ViewCounter views={data.views}/>
            <LikeBar likes={data.likes} dislikes={data.dislikes}/>
        </div>
    </div>
    )
}