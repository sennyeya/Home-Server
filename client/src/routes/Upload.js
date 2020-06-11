import React from 'react';
import AsyncMultiselect from '../shared/AsyncMultiselect'
import AsyncUpload from '../shared/AsyncUpload';
import FormElement from '../shared/FormElement';

export default function Upload(props){
    const [files, setFiles] = React.useState([])

    return (
        <div className="content">
            <FormElement label={<p>File(s): </p>} item={<AsyncUpload url="upload" update={setFiles}/>}/>
            <FormElement label={<p>Tag(s): </p>} item={<AsyncMultiselect url={"list_tags"}/>}/>
            <button style={{marginTop:"5%"}}>Finish Upload</button>
        </div>
    )
}