import React, { useCallback } from 'react';
import API from '../API';
import './Filter.css'
import { useEffect } from 'react';
import AsyncMultiselect from './AsyncMultiselect';
import HistoryTracking from './HistoryTracking';
import FormElement from './FormElement';
import InputWrapper from './InputWrapper';
import AsyncSingleSelect from './AsyncSingleSelect'
import ToggleSlider from './ToggleSlider';
import { getParamFromURL } from './Utils';

/**
 * Filter bar functionality, allows filtering based on type, date, and tags.
 * @param {{update:Function, }} props 
 * @param update parent function to pass selected options to parent element.
 */
export default function Filter(props) {
    /** Does the user want video media? */
    const [video, setVideo] = React.useState(getParamFromURL("video")||false);

    /** Does the user want image media? */
    const [image, setImage] = React.useState(getParamFromURL("image")||false);
    const [tags, setTags] = React.useState(getParamFromURL("tags")||[]);
    const [from, setFrom] = React.useState(getParamFromURL("from")||"");
    const [to, setTo] = React.useState(getParamFromURL("to")||"");
    const [sortBy, setSortBy] = React.useState(getParamFromURL("sortby")||"")

    /** Update parent whenever anything changes. */
    useEffect(() =>{
        props.update({video, image, tags, from, to, sortBy});
        props.trigger();
    }, [video, image, tags, from, to, sortBy])

    return (
        <div className="filter-bar">
            <HistoryTracking name="video" value={video} trigger={setVideo} overwrite/>
            <HistoryTracking name="image" value={image} trigger={setImage} overwrite/>
            <HistoryTracking name="tags" value={tags} trigger={setTags} list overwrite/>
            <HistoryTracking name="to" value={to} trigger={setTo} overwrite/>
            <HistoryTracking name="from" value={from} trigger={setFrom} overwrite/>
            <HistoryTracking name="sortby" value={sortBy} trigger={setSortBy} overwrite/>
            <div className="filter-bar-container">
                <div className="filter-item type-date">
                    <FormElement label={<label htmlFor="from">
                                            From:
                                        </label>} 
                                item={<InputWrapper children={
                                        <input type="date" 
                                            id="from" 
                                            value={from} 
                                            onChange={(e)=>setFrom(e.target.value?e.target.value:"")}/>
                                        }/>}/>
                    
                    <FormElement label={<label htmlFor="to">
                                            To:
                                        </label>} 
                                item={<InputWrapper children={
                                        <input type="date" 
                                                id="to" 
                                                min={from} 
                                                value={to} 
                                                onChange={(e)=>setTo(e.target.value?e.target.value:"")}/>}
                                        />}
                                />
                </div>
                <div className="filter-item type-media">
                    <FormElement label={<label>Image: </label>} item={<ToggleSlider cond={image} val1={true} val2={false} update={setImage}/>}/>
                    <FormElement label={<label>Video: </label>} item={<ToggleSlider cond={video} val1={true} val2={false} update={setVideo}/>}/>
                </div>
                <div className="filter-item type-tags">
                    <FormElement label={<label>Tag(s): </label>} item={<AsyncMultiselect url="tags" update={setTags}/>}/>
                    <FormElement label={<label>Sort By: </label>} item={<AsyncSingleSelect url="tags" update={setSortBy} selected={sortBy}/>}/>
                </div>
            </div>
        </div>
    )
}