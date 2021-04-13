import React, {useState, useEffect} from 'react'

const Video = ({iframe})=> {
    let ifra = document.createElement(iframe)
    
    console.log(iframe)
    return(
        <>
            {iframe}
        </>
    )

}
export default Video;