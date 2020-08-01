import React, {useEffect} from 'react';
import API from '../API';
import {LoadingIndicatorSmall} from './Loading';
import './AsyncMultiselect.css';
import InputWrapper from './InputWrapper'

/**
 * Generic multiselect that gets data dynamically. Only supports single selection, which clears after text entry.
 * @param {{url:String, update:Function}} props 
 * @param {String} props.url url to get data from, supports GET only.
 * @param {Function} props.update function to pass data back to parent element based on selections.
 */
export default function AsyncMultiselect(props){
    let [options, setOptions] = React.useState([]);
    let [loading, setLoading] = React.useState(true);
    let [query, setQuery] = React.useState("")
    let [filtered, setFiltered] = React.useState([])
    let [open, setOpen] = React.useState(false);
    let [selected, setSelected] = React.useState([]);

    // Get data.
    useEffect(()=>{
        API.get(props.url).then(e=>{
            setOptions(e.map((f, i)=>{return {value:f, id:i}}));
            setLoading(false)
        })
    }, [])

    // Filter gotten data with query.
    useEffect(()=>{
        setFiltered(options.filter(e=> e.value.includes(query) && !selected.some(f=>f.id===e.id)).slice(0, 5))
    }, [query])

    // Set query when someone selects an option. Passes selection back to parent.
    useEffect(()=>{
        setQuery("")
        props.update(selected)
        setFiltered(options.filter(e=>e.value.includes(query) && !selected.some(f=>f.id===e.id)).slice(0, 5))
    }, [selected])

    // Updates the visible lists when options is set.
    useEffect(()=>{
        setFiltered(options.slice(0,5))
        setQuery("");
    }, [options])

    return (
        <div className="select-wrapper">
            <InputWrapper children={
                <>
                    <div style={{display:"flex", flexDirection:"column", width: "97%", paddingLeft:"3%"}}>
                        <input type="text" onFocus={()=>setOpen(true)}
                                            onChange={(e)=>setQuery(e.target.value)} 
                                            value={query} 
                                            onBlur={(e)=>{
                                                if(e.relatedTarget && e.relatedTarget.className==="list-items"){
                                                    return;
                                                }
                                                setOpen(false);
                                            }}
                                            disabled={loading} />
                        {selected&&selected.length?<SelectedItems items={selected} update={setSelected}/>:<></>}
                    </div>
                    {loading?<LoadingIndicatorSmall color="black"/>:<></>}
                </>}/>
            <div className="list-items-container">
                <div className="list-items" tabIndex="0" style={open?{}:{display: "none"}}>
                    {filtered.map((e,i)=>{
                        return (
                            <button key={i} onClick={()=>{setOpen(true);setSelected(selected.concat(e))}}>
                                <span>{e.value}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )  
}

function SelectedItems(props){
    return (
        <div className='selected-items-container'>
            {props.items.map(e=>{
                return (
                    <div className='selected-item'>
                        <span>{e.value} </span>
                        <span onClick={()=>props.update(props.items.filter(f=>f.id!==e.id))} className="selected-item-remove">×</span>
                    </div>
                )
            })}
        </div>
    )
}