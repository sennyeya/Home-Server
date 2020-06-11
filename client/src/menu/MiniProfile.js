import React from 'react';

export default function MiniProfile(props) {
    return (
        <>
        <div>
            {
                props.user?
                    (<a href={props.user.url}>
                        <img src={props.user.image}/>
                    </a>)
                :
                <a href={"/setupProfile"}>
                </a>

            }       
        </div>
        </>
    )
}