"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import type { AuditLog } from "~/server/shared";
import Icon from "~/components/common/Icon";

type Props = {
  logs: AuditLog[];
};

const LogsTable = ({ logs }: Props) => {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns = React.useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: "method",
        header: () => "Metod",
        cell: (info) => {
          const method = info.getValue<"create" | "update" | "delete">();
          const color =
            method === "create"
              ? "bg-green-100 text-green-700"
              : method === "update"
                ? "bg-blue-100 text-blue-700"
                : "bg-red-100 text-red-700";
          return (
            <span
              className={`rounded px-2 py-1 text-xs font-semibold ${color}`}
            >
              {method.toUpperCase()}
            </span>
          );
        },
      },
      {
        accessorKey: "action",
        header: () => "Action",
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: "user.name",
        header: () => "Användare",
        cell: (info) => info.getValue<string>(),
      },
      {
        accessorKey: "createdAt",
        header: () => "Skapad",
        cell: (info) =>
          new Date(info.getValue<string>()).toLocaleString("sv-SE", {
            dateStyle: "short",
            timeStyle: "short",
          }),
      },
      {
        accessorKey: "data",
        header: "Data (JSON)",
        cell: (info) => {
          const value = info.getValue<unknown>();
          try {
            return (
              <div className="group relative">
                <Icon icon="Code" className="text-c5 w-5" />
                <pre className="absolute top-full right-0 z-10 hidden max-w-sm translate-y-1 overflow-x-auto rounded bg-gray-50 p-2 text-xs shadow group-hover:block">
                  {JSON.stringify(value, null, 2)}
                </pre>
              </div>
            );
          } catch {
            return <span className="text-red-500">Invalid JSON</span>;
          }
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: logs,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex h-full flex-col overflow-auto p-4">
      <div className="mb-3">
        <input
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search logs..."
          className="w-64 rounded border px-3 py-1 text-sm"
        />
      </div>

      <table className="min-w-full rounded-lg border text-sm">
        <thead className="bg-gray-100 text-left">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-b p-2 font-semibold select-none"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === "asc"
                            ? "Sort ascending"
                            : header.column.getNextSortingOrder() === "desc"
                              ? "Sort descending"
                              : "Clear sort"
                          : undefined
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="h-10 border-b">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LogsTable;
