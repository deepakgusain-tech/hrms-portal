"use client"

import * as React from "react"
import {
  ColumnDef,
  Row,
  SortingState,
  VisibilityState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, SlidersHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"

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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  rowHref?: (row: TData) => string | undefined
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title = "",
  actions,
  rowClassName,
  rowHref,
}: DataTableProps<TData, TValue>) {
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
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
      columnVisibility,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const columnOptions = table
    .getAllLeafColumns()
    .filter((column) => column.getCanHide())

  const isInteractiveElement = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    Boolean(target.closest("a, button, input, select, textarea, [role='button']"))

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

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-slate-500">
              Total: {table.getFilteredRowModel().rows.length}
            </div>

            {columnOptions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl border-slate-200 bg-white text-slate-600"
                  >
                    <SlidersHorizontal />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Filter columns</DropdownMenuLabel>
                  {columnOptions.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      className="capitalize"
                    >
                      {typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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

                          {header.column.getIsSorted() === "asc" ? (
                            <ArrowUp className="size-4 text-white/80" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ArrowDown className="size-4 text-white/80" />
                          ) : (
                            <ChevronsUpDown className="size-4 text-white/50" />
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
                      role={rowHref?.(row.original) ? "link" : undefined}
                      tabIndex={rowHref?.(row.original) ? 0 : undefined}
                      onClick={(event) => {
                        if (isInteractiveElement(event.target)) {
                          return
                        }

                        const href = rowHref?.(row.original)
                        if (href) {
                          router.push(href)
                        }
                      }}
                      onKeyDown={(event) => {
                        if (event.key !== "Enter" || isInteractiveElement(event.target)) {
                          return
                        }

                        const href = rowHref?.(row.original)
                        if (href) {
                          router.push(href)
                        }
                      }}
                      className={`border-b border-slate-100 transition-all hover:bg-cyan-50/50 ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      } ${
                        rowHref?.(row.original)
                          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                          : ""
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
                      colSpan={Math.max(table.getVisibleLeafColumns().length, 1)}
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
