import {
  makeStyles,
} from '@material-ui/core'
import Box from '@material-ui/core/Box'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import TextIcon from '@material-ui/icons/FontDownload'
import FloatIcon from '@material-ui/icons/Gradient'
import UnknownIcon from '@material-ui/icons/Help'
import IntegerIcon from '@material-ui/icons/LooksOne'
import React, { useState } from 'react'

import { forwardRef } from 'react';

import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
import ViewColumn from '@material-ui/icons/ViewColumn';
import MaterialTable from 'material-table'

import type { CfgBinFile, Code, CodeGroup, KeyTable, StringTable, Value, ValueTag } from './types'

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />)
};

const useStyles = makeStyles({
  card: {
    margin: '20px'
  },
})

interface DataValueListItemProps {
  value: Value
  stringTable: StringTable
}
const DataValueListItem: React.FC<DataValueListItemProps> = ({
  value,
  stringTable,
}) => (
  <ListItem>
    <ListItemIcon>
      {value.tag === "string" ? (
        <TextIcon />
      ) : value.tag === "int" ? (
        <IntegerIcon />
      ) : value.tag === "float" ? (
        <FloatIcon />
      ) : (
              <UnknownIcon />
            )}
    </ListItemIcon>
    <ListItemText>
      {value.tag === "string" ? stringTable[value.value] : value.value}
    </ListItemText>
  </ListItem>
)

interface DataTableProps {
  title: string
  columns: ValueTag[]
  codes: Code[]
  stringTable: StringTable
}
const DataTable: React.FC<DataTableProps> = ({
  title,
  columns,
  codes,
  stringTable,
}) => {
  const [tableColumns, setTableColumns] = useState(columns.map((col, idx) => ({
    title: col,
    field: idx.toString(10),
  })))
  const [data, setData] = useState(
    codes.map((code) => code.values.map(
      (val) => {
        if (val.tag === "string") {
          if (val.value === 0xFFFFFFFF) {
            return "[none]"
          }
          return stringTable[val.value]
        }
        return val.value
      }
    ))
  )
  return (
    <MaterialTable
      title={title}
      icons={tableIcons}
      columns={tableColumns}
      data={data}
      editable={{
        onBulkUpdate: changes =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              resolve();
            }, 500);
          })
      }}
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
    <Box className={classes.card}>
      <DataTable
        title={keyTable[codeGroup.crc32]}
        columns={codeGroup.columns}
        codes={codeGroup.codes}
        stringTable={stringTable}
      />
    </Box>
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
