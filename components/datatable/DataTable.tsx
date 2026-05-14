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
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronsUpDown,
  Eye,
  EyeOff,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react"
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
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: string
  actions?: React.ReactNode
  rowClassName?: (row: TData) => string
  rowHref?: (row: TData) => string | undefined
  tableClassName?: string
  headCellClassName?: string
  bodyCellClassName?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  title = "",
  actions,
  rowClassName,
  rowHref,
  tableClassName,
  headCellClassName,
  bodyCellClassName,
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
  const visibleColumnCount = columnOptions.filter((column) =>
    column.getIsVisible()
  ).length

  const getColumnLabel = (column: (typeof columnOptions)[number]) =>
    typeof column.columnDef.header === "string"
      ? column.columnDef.header
      : column.id.replace(/[-_]/g, " ")

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
                    className="h-10 rounded-2xl border-cyan-200 bg-[linear-gradient(180deg,#ffffff_0%,#ecfeff_100%)] px-3 text-slate-700 shadow-sm hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                      <SlidersHorizontal className="size-4" />
                    </span>
                    Columns
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
                      {visibleColumnCount}/{columnOptions.length}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-80 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl"
                >
                  <div className="rounded-t-2xl bg-[linear-gradient(135deg,#ecfeff_0%,#f8fafc_100%)] px-4 py-4">
                    <div className="flex items-start justify-between gap-3">

                     
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-cyan-100">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Visible
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {visibleColumnCount}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-slate-200">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Hidden
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {columnOptions.length - visibleColumnCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="mx-0 my-0" />

                  <div className="space-y-1 p-2">
                  {columnOptions.map((column) => (
                    <button
                      type="button"
                      key={column.id}
                      onClick={() =>
                        column.toggleVisibility(!column.getIsVisible())
                      }
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition-all hover:-translate-y-px",
                        column.getIsVisible()
                          ? "border-cyan-100 bg-[linear-gradient(135deg,rgba(236,254,255,0.85),rgba(248,250,252,1))] shadow-sm"
                          : "border-slate-200 bg-slate-50/80 hover:bg-slate-100/80"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative">
                          <Checkbox
                            checked={column.getIsVisible()}
                            className="border-slate-300 data-checked:border-cyan-600 data-checked:bg-cyan-600"
                          />
                        </div>
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                            column.getIsVisible()
                              ? "bg-cyan-100 text-cyan-700"
                              : "bg-white text-slate-400 ring-1 ring-slate-200"
                          )}
                        >
                          {column.getIsVisible() ? (
                            <Eye className="size-4" />
                          ) : (
                            <EyeOff className="size-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium capitalize text-slate-800">
                            {getColumnLabel(column)}
                          </p>
                          <p className="text-xs text-slate-500">
                            Field {column.getIndex() + 1}
                          </p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          column.getIsVisible()
                            ? "bg-cyan-100 text-cyan-700"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {column.getIsVisible() ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <LayoutGrid className="size-3.5" />
                        )}
                        {column.getIsVisible() ? "Shown" : "Hidden"}
                      </span>
                    </button>
                  ))}
                  </div>

                  <DropdownMenuSeparator className="mx-0 my-0" />

                  <div className="flex items-center justify-between gap-3 p-3">
                    <p className="inline-flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="size-4 text-cyan-700" />
                      Hidden columns can be restored anytime.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={() =>
                          columnOptions.forEach((column) =>
                            column.toggleVisibility(false)
                          )
                        }
                      >
                        Hide all
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-xl bg-cyan-700 text-white hover:bg-cyan-800"
                        onClick={() =>
                          columnOptions.forEach((column) =>
                            column.toggleVisibility(true)
                          )
                        }
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="max-w-full overflow-x-auto">
            <Table className={cn("table-fixed w-full", tableClassName)}>
              <TableHeader className="bg-gradient-to-r from-cyan-600 to-sky-500">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-b-0 hover:bg-transparent w-full"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          "cursor-pointer whitespace-nowrap px-4 py-4 text-sm font-semibold text-white",
                          headCellClassName
                        )}
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
                          className={cn(
                            "whitespace-nowrap px-4 py-4 text-sm text-slate-700",
                            bodyCellClassName
                          )}
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
