import React, { useState, useEffect } from 'react'
import { Box, Input, Card, CardContent, Typography, Grid, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
}));

const Navigation = ({ playlistSize, sendCurrentPage }) => {
  var [currentPage, setCurrentPage] = useState(0)

  const NUMBER_OF_VIDEOS_PER_PAGE = 6
  const classes = useStyles();

  useEffect(() => {
    sendCurrentPage(currentPage)
    handlePagination(currentPage)
  }, [currentPage])

  useEffect(() => {
    setCurrentPage(0)
  }, [playlistSize])


  function nextPage() {
    let pageValue = currentPage
    if (typeof currentPage == "string") {
      pageValue = parseInt(currentPage)
    }
    changePage(pageValue + 1)
  }

  function previousPage() {
    if (currentPage > 0) {
      let pageValue = currentPage
      changePage(pageValue - 1)
    }
  }

  function getFieldValue(event) {
    if (event.target.value !== undefined && event.target.value !== "") {
      console.log(event.target.value);
      return event.target.value;
    }
    else if (event.target.innerHTML !== undefined) {
      console.log(event.target.innerHTML);
      return event.target.innerHTML;
    }
    else {
      return event
    }
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

  function handlePagination(activePage) {
    let limInf = Math.max(0, activePage - 2)
    let limSup = parseInt(activePage) + 2
    var pages = document.getElementById("Pagination")
    if (pages != undefined) {
      pages.innerHTML = ""
      console.log(activePage + " " + limSup + " " + limInf)
      for (let i = limInf; i <= limSup; i++) {

        var number = document.createElement('a'); // is a node
        var space = document.createElement('p')
        var container = document.createElement('span')
        if (i == limInf || i == limSup)
          number.innerHTML = " " + i + " ";
        else
          number.innerHTML = i + " ";
        number.onclick = changePage
        space.innerText = " "
        container.appendChild(number);
        pages.appendChild(number)

      }
    }
  }

  return (
    <Box component={"div"} className={classes.root} >
      <Grid id="Container" container spacing={3} justify={"center"} alignItems={"center"} direction="column">
        <Grid item xs={12} md={3} >
          <Button variant="contained" color="secondary" onClick={previousPage}> PREVIOUS </Button>
          <span id="Pagination"> &nbsp;</span>
          <Button variant="contained" color="primary" onClick={nextPage} > NEXT </Button>
        </Grid>
        <Grid item xs={12} md={3}>
          <Input type="text" name="search" id="search" aria-label="Enter page number" onKeyDown={(e)=> {if(e.key==='Enter') {setCurrentPage(parseInt(document.getElementById("search").value))}} } ></Input>
          {
            document.getElementById("search") != null ? <Button variant="contained" color="default" onClick={function (e) { handlePagination(parseInt(document.getElementById("search").value)); setCurrentPage(parseInt(document.getElementById("search").value)) }}>Go</Button> : ""
          }
        </Grid>
        <Grid item xs={12} md={3} >
          <Button color="default" variant="contained" onClick={function () { setCurrentPage(Math.floor(Math.random() * (playlistSize / NUMBER_OF_VIDEOS_PER_PAGE))) }}> Random page </Button>
        </Grid>
      </Grid>
    </Box>

  )

}
export default Navigation;