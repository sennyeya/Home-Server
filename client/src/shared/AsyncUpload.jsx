import React, { useEffect } from 'react';
import API from '../API';
import Config from '../config'
import { LoadingIndicatorSmall } from './Loading';
import './AsyncUpload.css';
import check from '../resources/check.svg';
import x from '../resources/alert-circle.svg';
import uploadImage from '../resources/upload.svg';
import deleteIcon from '../resources/x.svg';

// Size of file upload, currently ~ 25MB
const chunkSize = 1024*1024*25

/**
 * @summary An asynchronous file uploader that uploads files outside of a form submit.
 * @param {Function} props.update callback to parent component to pass processed files out.
 */
export default function AsyncUpload(props){
    /** Loading state, updates to reload the display. */
    const [loading, setLoading] = React.useState(false);

    /** Number of additional files being added to upload. */
    const [adding, setAdding] = React.useState(0);

    /** Array of file metadata to display to user and pass to parent component. */
    const [files, setFiles] = React.useState();

    /** Current index in files that is being uploaded. */
    const [currentIndex, setCurrentIndex] = React.useState();

    /** Handles user deleting index, will be removed from files array. */
    const [deletedIndex, setDeletedIndex] = React.useState();

    /** Allows button to click hidden input. */
    const fileRef = React.createRef();

    /** Allows button to click second hidden input. */
    const addFileRef = React.createRef();

    /**
     * Triggered when user selects files. Will start the upload process.
     * @param {HTMLInputEvent} e event triggered by input.onChange.
     * @returns {null}
     */
    const upload = async (e) =>{
        const files = e.target.files;
        if(!files.length){
            return;
        }

        // 
        setDeletedIndex(-1);
        setFiles(Array.from(files).map(e=>{
            return {loading:false, completed:false, name:e.name, size:e.size, error:false, file:e}
        }))
    }

    /**
     * Used by the second input to effectively add more files to the upload.
     * @param {HTMLInputEvent} e event triggered by secondInput.onChange.
     * @returns {null}
     */
    const addMoreFiles = async (e) =>{
        if(!e.target.files.length){
            return;
        }

        // Set the number of files we are adding.
        setAdding(e.target.files.length)

        // Add those files to the list of files we have created.
        setFiles(files.concat(Array.from(e.target.files).map(e=>{
            return {
                loading:false, 
                completed:false, 
                name:e.name, 
                size:e.size, 
                error:false, 
                file:e
            }
        })))
    }

    /**
     * Files effect, used to update the uploading process.
     */
    useEffect(()=>{
        if(!files){
            return;
        }

        // If we are not adding any files, assume we have either just started uploading or removed an item.
        if(!adding){
            // If current index is undefined that means we are just starting, if deletedIndex > -1 that means we just deleted.
            setCurrentIndex(currentIndex !== undefined && deletedIndex > -1?(
                                deletedIndex >= currentIndex ?
                                    currentIndex :
                                    currentIndex - 1
                                ) : 0)
        }else{
            // If all the files have already been processed.
            if(currentIndex >= files.length - adding - 1){
                // Set current index to where the newest files were added.
                setCurrentIndex((files.length - adding) > 0 ? files.length - adding : 0)
            }

            // Reset added files.
            setAdding(0)
        }
    }, [files]);

    /**
     * Current Index effect, used to recurse through and do the uploads.
     */
    useEffect(()=>{
        if(currentIndex===undefined|| currentIndex===null){
            return;
        }
        (async function(){
            try{
                // If the current file doesn't exist or is already completed.
                if(!files[currentIndex] || files[currentIndex].completed){
                    // If we are done processing.
                    if(currentIndex>=files.length-1){
                        // Update the parent component with the new data.
                        if(props.update){
                            props.update(files)
                        }
                        return;
                    }
                    // If not, recurse.
                    setCurrentIndex(currentIndex+1);
                    return;
                }

                // Set loading.
                files[currentIndex].loading = true;

                // Update display.
                setLoading(true)

                // If upload succeeds, recurse.
                if(await send(files[currentIndex].file)){
                    files[currentIndex].loading = false;
                    files[currentIndex].completed = true;

                    // Update display.
                    setLoading(false);

                    // If we are not done, recurse.
                    if(currentIndex<files.length-1){
                        setCurrentIndex(currentIndex+1)
                    }
                    return;
                }// If not, stop recursing.
            }catch(err){
                console.log(err)
                files[currentIndex].loading = false;
                files[currentIndex].error = true;
                setLoading(false)
                setCurrentIndex(currentIndex+1)
            }
        })();
    }, [currentIndex])

    /**
     * Sends the file in chunks to the server.
     * @param {File} file The file that the user uploaded, from input.
     * @returns {Boolean} true if success, or false if interrupted.
     */
    const send = async (file) =>{
        let start = 0;
        let res = await API.get('start_upload', 
                            {
                                size:file.size, 
                                name:file.name, 
                                format: file.type
                            });

        files[currentIndex].uploadId = res.id;
        while(start<file.size){
            // If the current item was deleted, stop.
            if(deletedIndex===currentIndex){
                return false;
            }
            await sendChunk(res.id, file, start, (start+chunkSize)<file.size?
                                                            (start + chunkSize):
                                                            (file.size))
            start+=chunkSize
        }
        // If the current item was deleted, stop.
        if(deletedIndex===currentIndex){
            return false;
        }
        return true;
    }

    /**
     * 
     * @param {String} id Upload ID received from server.
     * @param {File} file File item from user.
     * @param {Number} start Where to start file slice.
     * @param {Number} end Where to end file slice, exclusive.
     * @returns {Promise<null>} resolves on success.
     */
    const sendChunk = (id, file, start, end) =>{
        return new Promise((res, rej)=>{
            let formData = new FormData();
            let request = new XMLHttpRequest();
            request.open('POST', Config.api+props.url);
            request.setRequestHeader('Content-Type', 'multipart/form-data');

            request.withCredentials = true;

            formData.append('id', id)
            formData.append('start', start);
            formData.append('end', end);
            formData.append('file', file.slice(start, end));

            request.send(formData);

            request.onload = (e)=>{
                res();
            }

            request.onerror = (e)=>{
                console.log(e, files)
                rej(e)
            }
        })
    }

    /**
     * Update the underlying object from the child display component.
     * @param {Number} index Index of file in files.
     * @param {String} action Description of what to do at the passed in index.
     */
    const updateFiles = (index, action) =>{
        if(action === 'delete'){
            setDeletedIndex(index);
            setFiles(files.slice(0, index).concat(files.slice(index+1, files.length)));
        }
    }
    
    return (
        <div className="file-upload-container">
            <input type="file" onChange={upload} ref={fileRef} style={{display:'none'}} multiple/>

            <input type="file" onChange={addMoreFiles} ref={addFileRef} style={{display:'none'}} multiple/>
            
            <FileDisplay files={files?files:[]} update={updateFiles} loading={loading}/>

            <button onClick = {()=>files&&files.length?addFileRef.current.click():fileRef.current.click()} title="Upload">
                <img src={uploadImage} className="color-glyph" style={{width:"20px", height:"20px"}}/>
            </button>
        </div>
    )
}

/**
 * 
 * @param {Object} props 
 * @param {Array<Object>} files Array of pseudo file objects with metadata about state.
 * @param {Function} update Update the parent component data array.
 * @param {Boolean} loading Hacky way to update the display without updating the files array.
 */
function FileDisplay(props){
    const [fileIterator, setFileIterator] = React.useState([]);

    useEffect(()=>{
        if(!props.files){
            return;
        }
        setFileIterator(props.files)
    }, [props.files])

    useEffect(()=>{
        setFileIterator(props.files)
    }, [props.loading])

    const removeElement = (index) =>{
        props.update(index, "delete")
    }

    return (
        <>
        {
            fileIterator.length? (
            <div className="file-display-container">
                <div className="file-display-item">
                {
                    fileIterator.map((e,i)=>{
                        return(
                        <div className="file-display-info" key={i}>
                            <div className="file-display-name">
                                <input defaultValue={fileIterator[i].name} onChange={(e)=>fileIterator[i].name=e.target.value} style={{background:"transparent", color:"white"}}/>
                            </div>
                            <div className="file-display-status">{
                                e.loading?
                                    <LoadingIndicatorSmall/>:
                                    (e.error?
                                        <img src={x} 
                                            style={{height:"15px", width:"15px"}} 
                                            className="color-glyph" 
                                            title="Error" 
                                            alt="Upload Error"/>:
                                        <img src={check} 
                                            style={{height:"15px", width:"15px"}} 
                                            className="color-glyph" 
                                            title="Success" 
                                            alt="Upload Success"/>
                                )}
                            </div>
                            <div className="file-display-action">
                                {
                                    (e.completed || e.error) ? 
                                    <>
                                    <img src={deleteIcon}
                                        style={{height:"15px", width:"15px"}} 
                                        className="color-glyph" 
                                        alt="Delete File?"
                                        title="Delete File?"
                                        onClick={()=>removeElement(i)}/>
                                    </>:
                                    <></>
                                }
                            </div>
                        </div>)
                    })
                }
                </div>
            </div>
        ):<></>}
        </>
    )
}