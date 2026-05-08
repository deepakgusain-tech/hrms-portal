"use client"

import * as React from "react"
import {
  ColumnDef,
  Row,
  SortingState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: string
  actions?: React.ReactNode
  rowClassName?: (row: TData) => string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title = "",
  actions,
  rowClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [currentData, setCurrentData] = React.useState<TData[]>(data)

  const [pagination, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    })

  React.useEffect(() => {
    setCurrentData(data)
  }, [data])

  const globalFilterFn = (
    row: Row<TData>,
    columnId: string,
    filterValue: string
  ) => {
    return String(row.getValue(columnId) ?? "")
      .toLowerCase()
      .includes(filterValue.toLowerCase())
  }

  const table = useReactTable({
    data: currentData,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <Card className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <CardHeader className="border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {title}
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Manage and view records easily
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
            {actions}
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="min-w-0 space-y-5 pt-6">
        {/* Search */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            placeholder="Search records..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-11 w-full max-w-sm rounded-2xl border-slate-200 bg-slate-50 px-4 focus-visible:ring-2 focus-visible:ring-indigo-500"
          />

          <div className="text-sm text-slate-500">
            Total: {table.getFilteredRowModel().rows.length}
          </div>
        </div>

        {/* Table */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gradient-to-r from-cyan-600 to-sky-500">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b-0 hover:bg-transparent"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer whitespace-nowrap px-4 py-4 text-sm font-semibold text-white"
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          {{
                            asc: "▲",
                            desc: "▼",
                          }[
                            header.column.getIsSorted() as string
                          ] ?? (
                            <span className="text-white/50">↕</span>
                          )}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className={`border-b border-slate-100 transition-all hover:bg-cyan-50/50 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      } ${
                        rowClassName
                          ? rowClassName(row.original)
                          : ""
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="whitespace-nowrap px-4 py-4 text-sm text-slate-700"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-28 text-center text-slate-500"
                    >
                      No results found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span className="text-sm text-slate-500">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
            -
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>

            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
