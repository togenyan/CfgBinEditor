import '../node_modules/@ag-grid-community/core/dist/styles/ag-grid.css'
import '../node_modules/@ag-grid-community/core/dist/styles/ag-theme-alpine.css'

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'
import type {
  CellValueChangedEvent,
  ColDef,
  GridReadyEvent,
  ValueGetterParams,
} from '@ag-grid-community/core'
import { AgGridReact } from '@ag-grid-community/react'
import { createStyles, makeStyles } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import React, { useEffect, useState } from 'react'

import type { CfgBinFile, KeyTable, RowType, StringTable } from './types'

const useStyles = makeStyles((theme) =>
  createStyles({
    card: {
      margin: theme.spacing(2),
    },
  })
)

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
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([])
  const [rowData, setRowData] = useState<RowType[]>([])
  const onGridReady = (params: GridReadyEvent): void => {
    params.api.sizeColumnsToFit()
  }
  const stringGetterGenerator: (
    colName: string
  ) => (params: ValueGetterParams) => string = (colName: string) => {
    return (params: ValueGetterParams): string => {
      // eslint-disable-next-line
      const offset: number = params.data[colName]
      if (offset === 0xffffffff) return '[none]'
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      return stringTable[offset] ?? '[error]'
    }
  }
  useEffect((): void => {
    setRowData(
      data.codes[codeGroupIdx].codes.map(
        (code): Record<string, number> =>
          code.values.reduce<RowType>((acc, curr, idx) => {
            acc[idx] = curr.value
            return acc
          }, {})
      )
    )

    setColumnDefs(
      data.codes[codeGroupIdx].columns.map((col, idx) => {
        const common = {
          headerName: col,
          field: idx.toString(10),
          resizable: true,
        }
        if (col === 'int') {
          return {
            ...common,
            editable: true,
            type: 'numericColumn',
            onCellValueChanged: (event: CellValueChangedEvent): void => {
              if (typeof event.node.rowIndex === 'undefined') return
              handleChange(
                codeGroupIdx,
                event.node.rowIndex,
                Object.entries(
                  event.data as Record<string, number | string>
                ).reduce((acc: Record<string, number>, cur) => {
                  acc[cur[0]] =
                    typeof cur[1] === 'number' ? cur[1] : parseInt(cur[1], 10)
                  return acc
                }, {})
              )
            },
          }
        } else if (col === 'string') {
          return {
            ...common,
            valueGetter: stringGetterGenerator(idx.toString(10)),
          }
        }
        return common
      })
    )
  }, [])
  return (
    <div className='ag-theme-alpine' style={{ height: 400, width: '100%' }}>
      <AgGridReact
        modules={[ClientSideRowModelModule]}
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
export const DataCard: React.FC<DataCardProps> = ({
  keyTable,
  stringTable,
  data,
  handleChange,
  codeGroupIdx,
}) => {
  const classes = useStyles()
  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant='h6'>
          {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            keyTable[data.codes[codeGroupIdx].crc32] ?? 'Unknown'
          }
        </Typography>
        <DataTable
          data={data}
          handleChange={handleChange}
          codeGroupIdx={codeGroupIdx}
          stringTable={stringTable}
        />
      </CardContent>
    </Card>
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
  return (
    <>
      {data.codes.map((_, idx) => {
        return (
          <DataCard
            keyTable={data.keyTable}
            stringTable={data.stringTable}
            data={data}
            handleChange={handleChange}
            codeGroupIdx={idx}
            key={idx}
          />
        )
      })}
    </>
  )
}
