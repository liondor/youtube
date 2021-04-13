import logo from './logo.svg';
import './App.module.css';
import { Box, MenuItem, Input, TextField, Card, CardContent, NativeSelect, Typography, Grid, Button, FormControl } from '@material-ui/core';
import React, { useState, useEffect} from "react"
import { Player, Navigation } from './Components'
import { fetchChannels, fetchVideos } from './api';

const NUMBER_OF_VIDEOS_PER_PAGE = 6
const API_URL = "http://localhost:3001/api/"

function readSingleFile(e) {
  var file = e.target
}

function App() {

  var [playlistSize, setPlaylistSize] = useState([])
  var [channelsList, setChannelsList] = useState([])
  var [currentPage, setCurrentPage] = useState(0)
  var [currentChannel, setCurrentChannel] = useState("All")


  
  useEffect(() => {

    async function getChannels() {

      const fetchedChannels = await fetchChannels();
      if (fetchChannels !== undefined) {
        setChannelsList(fetchedChannels)
        insertChannels(channelsList)
      }
    }
    getChannels();
  }, [])

  useEffect(() => {
    insertChannels(channelsList)
  }, [channelsList])

  

 
  function getFieldValue(event) {
    if(event.target.value!==undefined&&event.target.value!=="")
    {
      console.log(event.target.value);
      return event.target.value;
    }
    else if(event.target.innerHTML!==undefined) {
      console.log(event.target.innerHTML);
        return event.target.innerHTML;
    }
    else {
      return event
    }
  }

  function getPlaylistSize(playlistLength)
  {
    console.log(playlistLength)
    setPlaylistSize(playlistLength)
  }
  
  function getCurrentPage(page)
  {
    
    setCurrentPage(page)
  }


  function changePage(nombreOuEvent) {
    console.log(nombreOuEvent)
    let pageChosen = 0;
    if (nombreOuEvent.target) {

      pageChosen = getFieldValue(nombreOuEvent)
    }
    else {
      pageChosen = nombreOuEvent;
    }

    setCurrentPage(pageChosen)
  }

 
  function insertChannels(channels) {
    let select = document.getElementById("channelSelector")
    if (channels) {
      for (let i = 0; i < channels.length; i++) {
        let option = document.createElement('option');
        option.innerText = channels[i].author;
      //  select.innerHTML=<option> test</option>
 
      }
      console.log(select)
    }
  }

  function changeChannel(channelSelected) {
    let channel = getFieldValue(channelSelected);
    setCurrentChannel(channel)
    console.log("Test")
    changePage(0)

  }

  //<TextField color="primary" variant="outlined" label="Channel" select id="channelSelector" onChange={changeChannel} value={currentChannel}>

  return (
    <div className="App">
      <Box component="div" justify="center" alignItems="center">
      <FormControl variant="filled">
       <NativeSelect label="??" variant="filled" id="channelSelector" defaultValue={"All"} onChange={(e) => changeChannel(e)}>
          <option value="All">All</option>
          {channelsList.map(channel => <option value={channel.author}>{channel.author} </option>)}
      </NativeSelect>
      </FormControl>
      </Box>
      <Player sendPlaylistSize={getPlaylistSize} page={currentPage} currentChannel={currentChannel}/>
      <Navigation playlistSize={playlistSize} sendCurrentPage={getCurrentPage} />
    </div>
  );
}
export default App;
