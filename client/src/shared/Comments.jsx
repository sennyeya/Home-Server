import React, { useEffect } from 'react';
import FormElement from './FormElement';
import InputWrapper from './InputWrapper';
import './Comments.css'
import API from '../API';
import { LoadingIndicator } from './Loading';

/**
 * Comment page, allows user to view comments for a media item and add their own.
 * @param {{media: String, message:React.Ref}} props 
 * @param media ID for the media item that the user is viewing.
 */
export default function Comments(props){
    /** Current user comment. */
    const [comment, setComment] = React.useState("");

    /** Loading state. */
    const [loading, setLoading] = React.useState(true);

    /** Set of comments for user to see. */
    const [comments, setComments] = React.useState([]);

    /** Upload comment to server. */
    const postComment = () =>{
        API.post('comment', {content: comment, media: props.media}).then(e=>{
            setComment("")
            setLoading(true)
        })
    }

    /** Load comments when loading state is true. */
    useEffect(()=>{
        if(loading){
            API.get('comments', {media: props.media}).then(e=>{
                setComments(e)
                setLoading(false)
            });
        }
    }, [loading])

    return (
        <>
            {
                loading? <LoadingIndicator/>:
                <>
                    {comments.map((e, i)=>{
                        return ( 
                        <div key={i} className={"comment-item"+(i===0?" first":"")}>
                            <div className="comment-header">
                                <a href={"/profiles/"+e.user.id} style={{fontWeight:'bold'}}>{e.user.username}</a>
                                <span>{e.created}</span>
                            </div>
                            <span>{e.content}</span>
                            
                        </div> )
                    })}
                </>
            }
            <FormElement label={<span>Add your comment: </span>} item={<textarea onChange={(e)=>setComment(e.target.value)} value={comment} rows="4"></textarea>}/>
            <button onClick={postComment}>Post Comment</button>
        </>
    )
}