import React, {useContext} from 'react';
import AsyncMultiselect from '../shared/AsyncMultiselect'
import AsyncUpload from '../shared/AsyncUpload';
import FormElement from '../shared/FormElement';
import VideoPlayer from '../media/VideoPlayer';
import ImageViewer from '../media/ImageViewer'
import InputWrapper from '../shared/InputWrapper'
import API from '../API';
import MessagingContext, { useMessageOutlet } from '../contexts/MessagingContext'

/**
 * File upload process, allows uploading files asynchronously and then retrieving.
 */
export default function Upload(props){
    /** File ID. */
    const [file, setFile] = React.useState();

    /** Any tags the user has chosen. */
    const [tags, setTags] = React.useState([]);

    /** Name of the file upload. */
    const [name, setName] = React.useState("");

    const setMessage = useMessageOutlet()

    /** Post the upload to the server to complete the file upload process. */
    const postData = () =>{
        if(!file||!file.file){
            setMessage(new Error("File is a required field."));
            return
        }else if(!name){
            setMessage(new Error("Name is a required field."))
            return
        }
        API.post('create_content', {name, tags, id: file.file.uploadId}).then(e=>{
            setMessage(e.message);
            setFile(null);
            setTags([])
            setName("")
        }).catch(err=>{
            setMessage(new Error(err.message))
        })
    }

    return (
        <>
            <h1>Upload Content</h1>
            {file&& file.file && file.file.type.startsWith("video")
            ?
            <VideoPlayer blob={file?URL.createObjectURL(file.file):""} codec={(file&&file.file)?file.file.type:""} inMemory/>
            :
            <ImageViewer blob={file?URL.createObjectURL(file.file):""} inMemory/>}
            <FormElement label={<p>File: </p>} item={<AsyncUpload url="upload" update={setFile}/>}/>
            <FormElement label={<p>Name: </p>} item={
                <InputWrapper children={
                    <input value={name} onChange={(e)=>setName(e.target.value)}/>
                }/>
            }/>
            <FormElement label={<p>Tag(s): </p>} item={<AsyncMultiselect url={"list_tags"} update={setTags}/>}/>
            <button style={{marginTop:"5%"}} onClick={postData}>Finish Upload</button>
        </>
    )
}