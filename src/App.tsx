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
import SaveIcon from '@material-ui/icons/Save'
import CloseIcon from '@material-ui/icons/Close'
import type { AlertProps } from '@material-ui/lab/Alert'
import MuiAlert from '@material-ui/lab/Alert'
import React, { useCallback } from 'react'

import { DataCardContainer } from './DataTable'
import { Dropzone } from './Loader'
import { useTypedSelector } from './store'
import { useDispatch } from 'react-redux'
import { updateCodeGroup, closeFile, saveFile } from './actions'
import type { RowType } from './types'

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
  centeredBox: {
    margin: 'auto',
    padding: '20px',
    position: 'relative',
    textAlign: 'center',
    top: '50%',
    transform: 'translate(0, -50%)',
    width: '40vw',
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
  const { data, isError, isLoaded, isLoading, msg } = useTypedSelector(
    (state) => ({
      data: state.data,
      isError: state.isError,
      isLoaded: state.isLoaded,
      isLoading: state.isLoading,
      msg: state.msg,
    })
  )
  const dispatch = useDispatch()
  const dataChangeHandler = useCallback((codeGroupIdx: number, rowIdx: number, data: RowType): void => {
    // convert RowType (the data stored in the datagrid) back to CfgbBnFile.
    dispatch(updateCodeGroup({
      codeGroupIdx,
      rowIdx,
      data,
    }))
  }, [])
  const closeHandler = useCallback(() => dispatch(closeFile()), [])
  const saveHandler = useCallback(() => dispatch(saveFile()), [])
  return (
    <ThemeProvider theme={theme}>
      <Grid container direction='column' style={{ height: '100vh', flexWrap: 'nowrap' }}>
        <Grid item>
          <AppBar position='static' style={{ width: '100vw' }}>
            <Toolbar>
              <Typography variant='h6' component='h1' className={classes.title}>
                Config Editor
              </Typography>
              <IconButton color='inherit' disabled={!isLoaded} onClick={saveHandler}>
                <SaveIcon />
              </IconButton>
              <IconButton color='inherit' disabled={!isLoaded} onClick={closeHandler}>
                <CloseIcon />
              </IconButton>
              <IconButton color='inherit'>
                <InfoIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Grid>
        <Grid item className={classes.main}>
          {isLoading ? (
            <Box className={classes.centeredBox}>
              <CircularProgress />
            </Box>
          ) : !isLoaded ? (
            <>
              <Snackbar open={isError}>
                <Alert severity='error'>{msg}</Alert>
              </Snackbar>
              <Box className={classes.centeredBox}>
                <Dropzone />
              </Box>
            </>
          ) : data !== undefined ? <DataCardContainer data={data} handleChange={dataChangeHandler} />
                : <></>
          }
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default App
