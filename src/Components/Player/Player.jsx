import React, {useState, useEffect} from 'react'
import {Box, Card, CardContent, Typography, Grid} from '@material-ui/core';
import styles from './Player.module.css'
import {fetchVideos} from '../../api';
import Video from '../Video/Video';
import Iframe from 'react-iframe'
const Player = ({currentChannel, page, sendPlaylistSize})=> {
    
    const [videoArray, setVideoArray] = useState([]);
    var [currentPage, setCurrentPage] = useState(0)
    var [channel, setChannel] = useState("All")
    const NUMBER_OF_VIDEOS_PER_PAGE = 6
    const placeholder= [
      "//www.youtube.com/embed/9e-lWQdO-DA",
      "//www.youtube.com/embed/oq32PUomubY",
      "//www.youtube.com/embed/mNHyKA__VwU",
      "//www.youtube.com/embed/ylP73FT4r1U", 
      "//www.youtube.com/embed/msYCq2J8EPI",
      "//www.youtube.com/embed/Wn4VUhSAKQs"
    ]
    useEffect(() => {
        async function getPlaylist() {
          const fetchedPlaylist = await fetchVideos();;
          if (fetchedPlaylist !== undefined) {
            setVideoArray(fetchedPlaylist)
          }
        }
        getPlaylist();
      }, [])
      useEffect(() => {
        async function getPlaylist() {
          const fetchedPlaylist = await fetchVideos(currentChannel);
          if (fetchedPlaylist !== undefined) {
            setVideoArray(fetchedPlaylist)
          }
        }
        getPlaylist();
      }, [currentChannel])    

    
    useEffect(()=>{
        
        if(videoArray.length>0)
          populatePage()
        sendPlaylistSize(videoArray.length)
        
    },[videoArray,currentPage])
    
    useEffect(()=>{
        setCurrentPage(page)
    },[page])

    function populatePage() {
       // console.log("Function is called with page=" + page + " and the video list is " + (videoArray == undefined))
        let d = new Date();
        let n = d.getHours();
        let placeholder;
        var container = document.getElementById("Container")
        if (container != null && videoArray) {
          container.innerHTML = ""
          //  app.innerHTML=listOfVideo.map(x => x["iframe"])
          for (let i = currentPage * NUMBER_OF_VIDEOS_PER_PAGE; i < (currentPage * NUMBER_OF_VIDEOS_PER_PAGE + NUMBER_OF_VIDEOS_PER_PAGE); i++) {
            //  console.log(listOfVideo[i])
            if (videoArray[i] != undefined && (n >=13 && n < 23)) {
              let iframe=videoArray[i]["iframe"]
              //container.appendChild(<Video iframe={iframe} />)  
              container.innerHTML += videoArray[i]["iframe"]
    
            }
    
          }
          
          
         
        }
      }
 return (
  <Box  component={"div"} className={styles.container}>
      <Grid id="Container" container spacing={3} justify={"center"}>
        
        {placeholder.map(link =>  <iframe width="33%" height="270" frameborder="0" src={link}
         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>)}
      </Grid>
  </Box>

 )

}
export default Player;