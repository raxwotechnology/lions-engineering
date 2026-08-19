import React from 'react';

export const DataTable = ({ columns, data, emptyMessage = "No records found" }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
        <thead className="bg-slate-100 dark:bg-slate-950 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-5 py-3.5">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-5 py-4 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-slate-400 dark:text-slate-500 font-semibold">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
