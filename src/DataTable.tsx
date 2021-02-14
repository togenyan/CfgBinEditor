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
import React, { useEffect, useState } from 'react'

import { AgGridColumn, AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import type { CfgBinFile, KeyTable, StringTable, RowType } from './types'
import { ColDef, ColumnApi, GridApi, GridReadyEvent, ValueGetterParams } from 'ag-grid-community'

const useStyles = makeStyles((theme) => createStyles({
  card: {
    margin: theme.spacing(2),
  },
}))

interface DataTableProps {
  data: CfgBinFile
  handleChange: (codeGroupIdx: number, rowIdx: number, data: RowType) => void
  codeGroupIdx: number
  stringTable: StringTable
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  handleChange,
  codeGroupIdx,
  stringTable,
}) => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [gridColumnApi, setGridColumnApi] = useState<ColumnApi | null>(null)
  const [columnDefs, setColumnDefs] = useState<Array<ColDef>>([])
  const [rowData, setRowData] = useState<Array<RowType>>([])
  const onGridReady = (params: GridReadyEvent): void => {
    setGridApi(params.api)
    setGridColumnApi(params.columnApi)
    params.api.sizeColumnsToFit()
  }
  const stringGetterGenerator: (colName: string) => (params: ValueGetterParams) => string = (colName: string) => {
    return ((params: ValueGetterParams) => {
      const offset = params.data[colName]
      if (offset === 0xFFFFFFFF) return "[none]"
      return stringTable[offset] ?? "[error]"
    })
  }
  useEffect(() => {
    setRowData(data.codes[codeGroupIdx].codes.map((code) =>
      code.values.reduce((acc, curr, idx) => {
        acc[idx] = curr.value
        return acc
      }, {} as RowType))
    )

    setColumnDefs(data.codes[codeGroupIdx].columns.map((col, idx) => {
      const common = {
        headerName: col,
        field: idx.toString(10),
        resizable: true,
      }
      if (col === "int") {
        return {
          ...common,
          editable: true,
          type: 'numericColumn',
          onCellValueChanged: (params: any) => {
            handleChange(codeGroupIdx, params.node.rowIndex, params.data)
          }
        }
      } else if (col === "string") {
        return {
          ...common,
          valueGetter: stringGetterGenerator(idx.toString(10)),
        }
      }
      return common
    }))
  }, [])
  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        onGridReady={onGridReady}
        rowData={rowData}
        columnDefs={columnDefs}
      />
    </div>
  )
}

interface DataCardProps {
  keyTable: KeyTable
  stringTable: StringTable
  data: CfgBinFile
  handleChange: (codeGroupIdx: number, rowIdx: number, data: RowType) => void
  codeGroupIdx: number
}
export const DataCard: React.FC<DataCardProps> = ({ keyTable, stringTable, data, handleChange, codeGroupIdx }) => {
  const classes = useStyles()
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6">
          {keyTable[data.codes[codeGroupIdx].crc32] ?? 'Unknown'}
        </Typography>
        <DataTable
          data={data}
          handleChange={handleChange}
          codeGroupIdx={codeGroupIdx}
          stringTable={stringTable}
        />
      </CardContent>
    </Card >
  )
}


interface DataCardContainerProps {
  data: CfgBinFile
  handleChange: (codeGroupIdx: number, rowIdx: number, data: RowType) => void
}
export const DataCardContainer: React.FC<DataCardContainerProps> = ({
  data,
  handleChange,
}) => {
  return <>
    {data.codes.map((_, idx) => {
      return (
        <DataCard keyTable={data.keyTable} stringTable={data.stringTable} data={data} handleChange={handleChange} codeGroupIdx={idx} key={idx} />
      )
    })}
  </>
}
