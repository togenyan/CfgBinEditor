import {
  CircularProgress,
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from '@material-ui/core'
import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import { yellow } from '@material-ui/core/colors'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Snackbar from '@material-ui/core/Snackbar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import InfoIcon from '@material-ui/icons/Info'
import type { AlertProps } from '@material-ui/lab/Alert'
import MuiAlert from '@material-ui/lab/Alert'
import React from 'react'

import { Dropzone } from './Loader'
import { useTypedSelector } from './store'

const useStyles = makeStyles({
  main: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  alignCenter: {
    textAlign: 'center',
  },
})

const theme = createMuiTheme({
  palette: {
    primary: yellow,
    secondary: {
      main: '#5c6bc0',
    },
  },
})

const Alert = (props: AlertProps): JSX.Element => (
  <MuiAlert elevation={6} variant='filled' {...props} />
)

const App = (): JSX.Element => {
  const classes = useStyles()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data, isError, isLoaded, isLoading, msg } = useTypedSelector(
    (state) => ({
      data: state.data,
      isError: state.isError,
      isLoaded: state.isLoaded,
      isLoading: state.isLoading,
      msg: state.msg,
    })
  )
  return (
    <ThemeProvider theme={theme}>
      <Grid container direction='column' style={{ height: '100vh' }}>
        <Grid item>
          <AppBar position='static'>
            <Toolbar>
              <Typography variant='h6' component='h1' className={classes.title}>
                Config Editor
              </Typography>
              <IconButton color='inherit'>
                <InfoIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Grid>
        <Grid item className={classes.main}>
          {
            isLoading ? (
              <Box className={classes.alignCenter}>
                <CircularProgress />
              </Box>
            ) : !isLoaded ? (
              <Dropzone />
            ) : isError ? (
              <Snackbar>
                <Alert severity='error'>{msg}</Alert>
              </Snackbar>
            ) : (
              <></>
            )
            /* : <DataTable data={decodeArrayBuffer(data)}}> */
          }
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default App
