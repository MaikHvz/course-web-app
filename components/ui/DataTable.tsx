import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T>({ columns, data, emptyMessage = "No hay datos para mostrar.", onRowClick }: DataTableProps<T>) {
  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-gray-950/50 text-xs uppercase font-semibold text-gray-400 border-b border-gray-800">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr 
                  key={index} 
                  className={`hover:bg-gray-800/50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(item) : String((item as any)[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
