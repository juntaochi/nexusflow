'use client';

import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actionRenderer?: (item: T) => React.ReactNode;
}

export function DataTable<T>({ columns, data, actionRenderer }: DataTableProps<T>) {
  return (
    <div className="rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black/60 border-b border-white/10">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-4 text-sm font-medium text-white/70 uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
              {actionRenderer && (
                <th className="px-6 py-4 text-sm font-medium text-white/70 uppercase tracking-wider text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((item, index) => (
              <tr
                key={index}
                className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200"
              >
                {columns.map((column) => (
                  <td key={`${index}-${column.key}`} className="px-6 py-4 text-sm text-white/90">
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
                {actionRenderer && (
                  <td className="px-6 py-4 text-sm text-right">
                    {actionRenderer(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="p-8 text-center text-white/40 text-sm">
          No data available
        </div>
      )}
    </div>
  );
}
