import React, {useEffect} from 'react';
import API from '../API';
import {LoadingIndicatorSmall} from './Loading';
import './AsyncMultiselect.css';
import InputWrapper from './InputWrapper'

/**
 * Generic single select that gets data dynamically. Only supports single selection, which clears after text entry.
 * @param {{url:String, update:Function}} props 
 * @param {String} props.url url to get data from, supports GET only.
 * @param {Function} props.update function to pass data back to parent element based on selections.
 */
export default function AsyncSingleSelect(props){
    /** Picklist options. */
    let [options, setOptions] = React.useState([]);

    /** Loading state. */
    let [loading, setLoading] = React.useState(true);

    /** Query that the user has input to filter options. */
    let [query, setQuery] = React.useState("");

    /** Set of options that are presented to user. Always a subset of options. */
    let [filtered, setFiltered] = React.useState([]);

    /** Sublist shown state. */
    let [open, setOpen] = React.useState(false);

    /** Index of selected element. */
    let [selected, setSelected] = React.useState(-1);

    // Get data.
    useEffect(()=>{
        API.get(props.url).then(e=>{
            setOptions(e.map((f, i)=>{return {value:f, id:i}}));
            setLoading(false)
        })
    }, [])

    useEffect(()=>{
        setSelected(options.map(e=>e.value).indexOf(props.selected))
    }, [props.selected])

    // Filter gotten data with query.
    useEffect(()=>{
        if(!options.some(e=>e.id===selected && e.value===query)){
            setSelected(-1);
            setFiltered(options.filter(e=> e.value.toLowerCase().includes(query.toLowerCase())).slice(0, 5));
            props.update("");
        }else{
            setFiltered(options.filter(e=> e.value.toLowerCase().includes(query.toLowerCase()) && e.id!==selected).slice(0, 5));
        }
    }, [query])

    // Set query when someone selects an option. Passes selection back to parent.
    useEffect(()=>{
        if(selected!==-1){
            setQuery(options[selected].value);
            props.update(options[selected].value)
        }
    }, [selected]);

    // Updates the visible lists when options is set.
    useEffect(()=>{
        setFiltered(options.slice(0,5))
    }, [options])

    return (
        <div className="select-wrapper">
            <InputWrapper children={
                <>
                    <div style={{display:"flex", flexDirection:"column", width:"97%", paddingLeft:"3%"}}>
                        <input type="text" onFocus={()=>setOpen(true)}
                                            onChange={(e)=>setQuery(e.target.value)} 
                                            value={query} 
                                            onBlur={(e)=>{
                                                if(e.relatedTarget && e.relatedTarget.className==="list-item"){
                                                    return;
                                                }
                                                setOpen(false);
                                            }}
                                            disabled={loading} />
                    </div>
                    {loading?<LoadingIndicatorSmall color="black"/>:<></>}
                </>}/>
            <div className="list-items-container">
                <div className="list-items" tabIndex="0" style={open?{}:{display: "none"}}>
                    {filtered.map((e, i)=>{
                        return (
                            <button className="list-item" key={i} onClick={()=>{setOpen(true);setSelected(e.id)}}>
                                <span>{e.value}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )  
}