import {
  makeStyles,
  createStyles,
} from '@material-ui/core'
import Box from '@material-ui/core/Box'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import TextIcon from '@material-ui/icons/FontDownload'
import Typography from '@material-ui/core/Typography'
import React, { useState } from 'react'

import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import DataGrid from 'react-data-grid'

import type { CfgBinFile, Code, CodeGroup, KeyTable, StringTable, Value, ValueTag } from './types'

const useStyles = makeStyles((theme) => createStyles({
  card: {
    margin: theme.spacing(2),
  },
}))

interface DataTableProps {
  columns: ValueTag[]
  codes: Code[]
  stringTable: StringTable
}
const DataTable: React.FC<DataTableProps> = ({
  columns,
  codes,
  stringTable,
}) => {
  const tableColumns = columns.map((col, idx) => ({
    name: col,
    key: idx.toString(10),
  }))
  const data = codes.map((code) =>
    code.values.reduce((acc, curr, idx) => {
      acc[idx.toString(10)] = (curr.tag === "string") ?
        (curr.value === 0xFFFFFFFF) ? "[none]"
          : stringTable[curr.value]
        : curr.value.toString(10);
      return acc
    },
      {} as Record<string, string>))
  return (
    <DataGrid
      columns={tableColumns}
      rows={data}
      edit
    />
  )
}

interface DataCardProps {
  keyTable: KeyTable
  stringTable: StringTable
  codeGroup: CodeGroup
}
export const DataCard: React.FC<DataCardProps> = ({ keyTable, stringTable, codeGroup }) => {
  const classes = useStyles()
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6">
          {keyTable[codeGroup.crc32]}
        </Typography>
        <DataTable
          columns={codeGroup.columns}
          codes={codeGroup.codes}
          stringTable={stringTable}
        />
      </CardContent>
    </Card >
  )
}


interface DataCardContainerProps {
  data: CfgBinFile
}
export const DataCardContainer: React.FC<DataCardContainerProps> = ({ data }) => {
  const classes = useStyles()
  return <>
    {data.codes.map((codeGroup: CodeGroup, idx) => {
      return (
        <DataCard keyTable={data.keyTable} stringTable={data.stringTable} codeGroup={codeGroup} key={idx} />
      )
    })}
  </>
}
