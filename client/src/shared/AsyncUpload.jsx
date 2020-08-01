import React, { useEffect } from 'react';
import API from '../API';
import Config from '../config'
import './AsyncUpload.css';
import uploadImage from '../resources/upload.svg';

// Size of file upload, currently ~ 25MB
const chunkSize = 1024*1024*25

/**
 * @summary An asynchronous file uploader that uploads files outside of a form submit.
 * @param {{update:Function}} props
 * @param {Function} props.update callback to parent component to pass processed files out.
 */
export default function AsyncUpload(props){
    /** Loading state, updates to reload the display. */
    const [loading, setLoading] = React.useState(false);

    const [deleted, setDeleted] = React.useState(false)

    /** Array of file metadata to display to user and pass to parent component. */
    const [file, setFile] = React.useState();

    /** Allows button to click hidden input. */
    const fileRef = React.createRef();

    /**
     * Triggered when user selects files. Will start the upload process.
     * @param {HTMLInputEvent} e event triggered by input.onChange.
     * @returns {null}
     */
    const upload = async (e) =>{
        const newFile = e.target.files[0];
        if(!newFile){
            setDeleted(file);
            return;
        }else if(file && newFile!==file.file && loading){
            setDeleted(file);
        }

        setFile({loading:false, completed:false, name:newFile.name, size:newFile.size, error:false, file:newFile})
    }

    /**
     * Files effect, used to update the uploading process.
     */
    useEffect(()=>{
        if(!file){
            if(deleted){
                setLoading(false)
            }
            return;
        }

        /**
         * Sends the file in chunks to the server.
         * @param {File} file The file that the user uploaded, from input.
         * @returns {Boolean} true if success, or false if interrupted.
         */
        const send = async (fileObj) =>{
            let start = 0;
            let res;
            try{
                res = await API.get('start_upload', 
                                {
                                    size:fileObj.size, 
                                    name:fileObj.name, 
                                    format: fileObj.type
                                });
            }catch(err){
                console.log(err)
                return false;
            }

            fileObj.uploadId = res.id;

            while(start<fileObj.size){
                console.log({start, size:fileObj.size, deleted, fileObj})
                // If the current item was deleted, stop.
                if(deleted===fileObj){
                    setDeleted(null)
                    return false;
                }
                await sendChunk(res.id, fileObj, start, (start+chunkSize)<fileObj.size?
                                                                (start + chunkSize):
                                                                (fileObj.size))
                start+=chunkSize
            }
            return true;
        }

        // Update display.
        setLoading(true);
        (async ()=>{
            // If upload succeeds, recurse.
            if(await send(file.file)){
                file.loading = false;
                file.completed = true;
                props.update(file);
                // Update display.
                setLoading(false);
            }else{
                file.error = true;
                setLoading(false)
            }
        })();
    }, [file]);

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
                rej(e)
            }
        })
    }
    
    return (
        <div className="file-upload-container">
            <input type="file" onChange={upload} ref={fileRef} style={{display:'none'}}/>

            <button onClick = {()=>fileRef.current.click()} title="Upload">
                <img src={uploadImage} className="color-glyph" style={{width:"20px", height:"20px"}}/>
            </button>
        </div>
    )
}