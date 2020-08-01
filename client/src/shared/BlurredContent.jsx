import React from 'react'

/**
 * A simple blurred content section.
 * @param {{overlay:React.Component}} props 
 * @param {React.Component} overlay the content to show over top of the blurred content.
 */
export default function BlurredContent(props){
    return (
        <div className='hidden-gallery'>
            <div className='blurred-content'>
            </div>
            <div className='centered-content'>
            <span>
                {props.overlay}
            </span>
            </div>
        </div>
    )
}