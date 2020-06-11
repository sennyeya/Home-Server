import React from 'react';
import API from '../API';
import './Filter.css'
import { useEffect } from 'react';
import AsyncMultiselect from './AsyncMultiselect';
import {CustomCheckmark} from './CustomInputs'
import HistoryTracking from './HistoryTracking';
import FormElement from './FormElement';
import InputWrapper from './InputWrapper'

export default function Search(props) {
    const [video, setVideo] = React.useState(false);
    const [image, setImage] = React.useState(false);
    const [tags, setTags] = React.useState([]);
    const [from, setFrom] = React.useState("");
    const [to, setTo] = React.useState("");
    const videoRef = React.createRef();
    const imageRef = React.createRef();
    const tagsRef = React.createRef();
    const toRef = React.createRef();
    const fromRef = React.createRef();

    const requestSearch = (e) =>{
        props.update({video, image, tags, from, to});
    }

    useEffect(()=>{
        if(typeof video === 'string'){
            setVideo(video==="true")
        }
        if(typeof image === 'string'){
            setImage(image==='true')
        }
    }, [video, image, tags, from, to])

    return (
        <div className="filter-bar">
            <HistoryTracking name="video" value={video} ref={videoRef} trigger={setVideo} overwrite/>
            <HistoryTracking name="image" value={image} ref={imageRef} trigger={setImage} overwrite/>
            <HistoryTracking name="tags" value={tags} ref={tagsRef} trigger={setTags} overwrite/>
            <HistoryTracking name="to" value={to} ref={toRef} trigger={setTo} overwrite/>
            <HistoryTracking name="from" value={from} ref={fromRef} trigger={setFrom} overwrite/>
            <div className="filter-bar-container">
                {console.log(props.options)}
                <div className="filter-item type-date">
                    <FormElement label={<label htmlFor="from">
                                            From:
                                        </label>} 
                                item={<InputWrapper children={
                                        <input type="date" 
                                            id="from" 
                                            value={from} 
                                            onChange={(e)=>setFrom(e.target.value)}/>
                                        }/>}/>
                    
                    <FormElement label={<label htmlFor="to">
                                            To:
                                        </label>} 
                                item={<InputWrapper children={
                                        <input type="date" 
                                                id="to" 
                                                min={from} 
                                                value={to} 
                                                onChange={(e)=>setTo(e.target.value)}/>}
                                        />}
                                />
                </div>
                <div className="filter-item type-media">
                    <FormElement label={<label>Image: </label>} item={<CustomCheckmark checked={image} id="image" update={setImage}/>}/>
                    <FormElement label={<label>Video: </label>} item={<CustomCheckmark checked={video} id="video" update={setVideo}/>}/>
                </div>
                <div className="filter-item type-tags">
                    <FormElement label={<label>Tag(s): </label>} item={<AsyncMultiselect url="list_tags" update={setTags}/>}/>
                </div>
            </div>
            <button onClick={requestSearch}>Filter</button>
        </div>
    )
}