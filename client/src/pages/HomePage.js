import React from 'react'
import { Link } from 'react-router-dom'
import Container from '@mui/material/Container'
import Box  from "@mui/material/Box"
import {creatTheme,ThemeProvider}from "@mui/material/styles"
import { createTheme } from '@mui/system'


const HomePage = () => {
  return (
	  <Container sx={{ bgcolor: '#cfe8fc', height: '100vh' }}>
		  <h1>Homepage</h1>
		  <Link to="/sign-in">Sign In</Link> <br/>
		  <Link to="/sign-up">Sign Up</Link>
	  </Container>
  )
}

export default HomePage
