import React, { useEffect } from 'react'
import { LoadingIndicator } from '../shared/Loading'
import { NumberedPages } from '../shared/Buttons';
import Gallery from '../shared/Gallery';
import API from '../API';
import FormElement from '../shared/FormElement';
import InputWrapper from '../shared/InputWrapper';
import { useMessageOutlet } from '../contexts/MessagingContext'

/**
 * This route allows the user to create a new playlist.
 */
export default function CreatePlaylist(){
    /** Loading state. */
    const [loading, setLoading] = React.useState(true);

    /** Actual media elements from API. */
    const [media, setMedia] = React.useState([]);

    /** Used for button calibration, when to stop showing pages. */
    const [length, setLength] = React.useState(0);

    /** Page size, meant to allow for later page size dropdown. */
    const [size] = React.useState(24);

    /** Current offset/page, determined by page size. 1 != page 1 */
    const [offset, setOffset] = React.useState(0);

    /** Set of currently selected items from the user. */
    const [selected, setSelected] = React.useState([]);

    /** Name of the playlist. */
    const [name, setName] = React.useState("");

    const setMessage = useMessageOutlet();

    /**
     * Create a new playlist and notify the user of any field errors.
     */
    const createPlaylist = React.useCallback(() =>{
        if(!name){
            setMessage(new Error("Name needs to be filled."))
        }else{
            API.post("/user/create_playlist", {name, items:selected.map(e=>e.id)})
            .then(()=>{
                setMessage("Successfully created a new playlist!")
                window.location.href="/dashboard"
            })
        }
    }, [name, selected, setMessage])

    /**
     * Reload the media gallery, when the user changes the offset/page.
     */
    useEffect(()=>{
        API.get('media_gallery', {offset}).then(e=>{
            setMedia(e.media);
            setLength(e.length);
            setLoading(false);
        })
    }, [offset])

    return (
        <>
            <h1>Create a Playlist</h1>
            {loading?<LoadingIndicator/>:
            (<>
                <FormElement label={<span>Name: </span>} item={<InputWrapper children={<input onChange={(e)=>setName(e.target.value)}/>}/>} required={name}/>
                <Gallery items={media} select update={setSelected} selected={selected}/>
                <NumberedPages size={size} length={length} offset={offset} update={setOffset}/>
                <button onClick={createPlaylist}>Create</button>
            </>)}
        </>
    )
}