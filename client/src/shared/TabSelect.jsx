import React from 'react';
import './TabSelect.css'

/**
 * A simple tab pane.
 * @param {Array<String>} props.tabs tab names, index-matched to content.
 * @param {Array<React.Component>} props.content tab content to render 
 */
export default function TabSelect(props){
    /** Current tab index setting. */
    const [currentTab, setCurrentTab] = React.useState(0);

    /** Assert that we are actually trying to render some set of tabs. */
    if(!props.content.length){
        return <></>
    }
    return (
        <div className='tab-container'>
            <div className='tab-header'>
                {props.tabs.map((e, i)=>{
                    return <span className={"tab"+(i===currentTab?" selected":"")} onClick={()=>setCurrentTab(i)}>{e}</span>
                })}
            </div>
            <div className='tab-content'>
                {props.content[currentTab]}
            </div>
        </div>
    )
}