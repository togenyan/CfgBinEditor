import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core'
import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'
import { yellow } from '@material-ui/core/colors'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import Link from '@material-ui/core/Link'
import Modal from '@material-ui/core/Modal'
import Snackbar from '@material-ui/core/Snackbar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import InfoIcon from '@material-ui/icons/Info'
import SaveIcon from '@material-ui/icons/Save'
import type { AlertProps } from '@material-ui/lab/Alert'
import MuiAlert from '@material-ui/lab/Alert'
import { saveAs } from 'file-saver'
import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

import { closeFile, saveFile, updateCodeGroup } from './actions'
import { DataCardContainer } from './DataTable'
import { Dropzone } from './Loader'
import { useTypedSelector } from './store'
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
    outline: 'none',
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

interface SaveButtonProps {
  disabled: boolean
  onClick: () => void
  outData?: ArrayBuffer
  filename: string
}
const SaveButton: React.FC<SaveButtonProps> = ({
  disabled,
  onClick,
  outData,
  filename,
}) => {
  useEffect(() => {
    if (outData) {
      saveAs(
        new Blob([outData], { type: 'application/octet-binary' }),
        filename
      )
    }
  }, [outData])
  return (
    <IconButton color='inherit' disabled={disabled} onClick={onClick}>
      <SaveIcon />
    </IconButton>
  )
}

interface InfoDialogProps {
  isOpen: boolean
  handleClose: () => void
}
const InfoDialog: React.FC<InfoDialogProps> = ({ isOpen, handleClose }) => {
  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Config Editor</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <p>(c) 2021 togenyan</p>
          <p>
            You can get the source code of this application from
            <br />
            <Link
              href='https://github.com/togenyan/CfgBinEditor'
              color='secondary'
            >
              https://github.com/togenyan/CfgBinEditor
            </Link>
          </p>
        </DialogContentText>
      </DialogContent>
    </Dialog>
  )
}

const App = (): JSX.Element => {
  const classes = useStyles()
  const {
    data,
    filename,
    outData,
    isError,
    isLoaded,
    isLoading,
    isSaving,
    msg,
  } = useTypedSelector((state) => ({
    data: state.data,
    filename: state.filename,
    outData: state.outData,
    isError: state.isError,
    isLoaded: state.isLoaded,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    msg: state.msg,
  }))
  const dispatch = useDispatch()
  const dataChangeHandler = useCallback(
    (codeGroupIdx: number, rowIdx: number, rowData: RowType): void => {
      // Convert RowType (the data stored in the datagrid) back to CfgbBnFile.
      dispatch(
        updateCodeGroup({
          codeGroupIdx,
          rowIdx,
          rowData,
        })
      )
    },
    []
  )
  const closeHandler = useCallback(() => dispatch(closeFile()), [])
  const saveHandler = useCallback(() => {
    if (data) dispatch(saveFile(data))
  }, [data])
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const infoDialogCloseHandler = useCallback(() => {
    setInfoDialogOpen(false)
  }, [])
  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        direction='column'
        style={{ height: '100vh', flexWrap: 'nowrap' }}
      >
        <Grid item>
          <AppBar position='static' style={{ width: '100vw' }}>
            <Toolbar>
              <Typography variant='h6' component='h1' className={classes.title}>
                Config Editor
              </Typography>
              <SaveButton
                disabled={!isLoaded}
                filename={filename}
                outData={outData}
                onClick={saveHandler}
              />
              <IconButton
                color='inherit'
                disabled={!isLoaded}
                onClick={closeHandler}
              >
                <CloseIcon />
              </IconButton>
              <IconButton
                color='inherit'
                onClick={(): void => {
                  setInfoDialogOpen(true)
                }}
              >
                <InfoIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Grid>
        <Grid item className={classes.main}>
          <>
            <InfoDialog
              isOpen={infoDialogOpen}
              handleClose={infoDialogCloseHandler}
            />
            <Modal open={isSaving}>
              <Box className={classes.centeredBox}>
                <CircularProgress />
              </Box>
            </Modal>
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
            ) : typeof data !== 'undefined' ? (
              <DataCardContainer data={data} handleChange={dataChangeHandler} />
            ) : (
              <></>
            )}
          </>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}

export default App
