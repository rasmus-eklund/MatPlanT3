"use client";

import { useMemo, useState } from "react";
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
import Icon, { type IconName } from "~/components/common/Icon";
import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

type Props = {
  logs: AuditLog[];
  showUser: boolean;
};

const LogsTable = ({ logs, showUser = false }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const columnVisibility = useMemo(
    () => ({
      user: showUser,
    }),
    [showUser],
  );

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        accessorKey: "method",
        header: () => <Header text="Metod" />,
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
        header: () => <Header text="Action" />,
        cell: (info) => info.getValue<string>(),
      },
      {
        id: "user",
        accessorKey: "user.name",
        header: () => <Header text="Användare" />,
        cell: (info) => (
          <p className="text-nowrap">{info.getValue<string>()}</p>
        ),
      },
      {
        accessorKey: "createdAt",
        header: () => <Header text="Skapad" />,
        cell: (info) => (
          <p className="text-nowrap">
            {new Date(info.getValue<string>()).toLocaleString("sv-SE", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </p>
        ),
      },
      {
        accessorKey: "data",
        header: () => <Header text="Data" />,
        cell: (info) => {
          const value = info.getValue<unknown>();
          try {
            const parsed = JSON.stringify(value, null, 2);
            return <JSONView value={parsed} />;
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
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="bg-c3 flex h-full flex-col overflow-auto p-4">
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
              {headerGroup.headers.map((header) => {
                const ic = icon[header.column.getIsSorted() as string];
                return (
                  <th
                    key={header.id}
                    className="border-b p-2 font-semibold select-none"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          "flex items-center gap-1",
                          header.column.getCanSort() &&
                            "cursor-pointer select-none",
                        )}
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
                        {ic && <Icon icon={ic} />}
                      </div>
                    )}
                  </th>
                );
              })}
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

const Header = ({ text }: { text: string }) => (
  <p className="text-nowrap">{text}</p>
);

const JSONView = ({ value }: { value: string }) => {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem className="border-none" value="item-1">
        <AccordionTrigger className="flex items-center gap-2 p-0 text-nowrap hover:no-underline">
          Visa Data
        </AccordionTrigger>
        <AccordionContent>
          <pre className="max-w-full overflow-x-auto rounded bg-gray-50 p-2 text-xs">
            {value}
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const icon: Record<string, IconName> = {
  asc: "ChevronUp",
  desc: "ChevronDown",
};
export default LogsTable;
