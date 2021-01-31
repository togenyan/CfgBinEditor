import { makeStyles } from '@material-ui/core'
import { grey } from '@material-ui/core/colors'
import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDispatch } from 'react-redux'

import { loadFile } from './actions'

const useStyles = makeStyles({
  dropzone: {
    backgroundColor: grey[200],
    border: `dashed 2px ${grey[400]}`,
    borderRadius: '10px',
    boxSizing: 'border-box',
    margin: 'auto',
    padding: '60px 20px',
    position: 'relative',
    textAlign: 'center',
    top: '50%',
    transform: 'translate(0, -50%)',
    width: '40vw',
  },
})

interface DashedBorderAreaProps {
  description: string
}

const DashedBorderArea: React.FC<DashedBorderAreaProps> = ({ description }) => {
  const classes = useStyles()
  return <div className={classes.dropzone}>{description}</div>
}

export const Dropzone = (): JSX.Element => {
  const dispatch = useDispatch()
  const onDrop = useCallback((acceptedFiles: File[]) => {
    dispatch(loadFile(acceptedFiles[0]))
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  return (
    <div {...getRootProps()} style={{ height: '100%' }}>
      <input {...getInputProps()} />
      {
        <DashedBorderArea
          description={
            isDragActive
              ? 'Drop the file here'
              : 'Drag and drop a file here, or click to select a file'
          }
        />
      }
    </div>
  )
}
