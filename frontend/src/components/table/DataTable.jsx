import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import styles from './DataTable.module.css';
import { TableRowSkeleton } from '../ui/Skeleton';

function DataTable({ columns, data, loading, pageSize = 15 }) {
  const [sorting, setSorting] = useState([]);
  
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={styles.th}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    <div className={styles.headerCell}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className={styles.sortIndicator}>
                          {{
                            asc: ' ▴',
                            desc: ' ▾',
                          }[header.column.getIsSorted()] || ' ↕'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRowSkeleton key={idx} cols={columns.length} />
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.noDataCell}>
                  NO RECORDS FOUND
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className={styles.tr}>
                  {row.getVisibleCells().map((cell) => {
                    const value = cell.getValue();
                    const isNumeric = typeof value === 'number' || 
                      (cell.column.id && (
                        cell.column.id.toLowerCase().includes('count') || 
                        cell.column.id.toLowerCase().includes('total') || 
                        cell.column.id.toLowerCase().includes('age') || 
                        cell.column.id.toLowerCase().includes('year')
                      ));
                    return (
                      <td 
                        key={cell.id} 
                        className={`${styles.td} ${isNumeric ? styles.numericCell : ''}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!loading && table.getPageCount() > 1 && (
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            PAGE {table.getState().pagination.pageIndex + 1} OF {table.getPageCount()}
          </div>
          <div className={styles.pageActions}>
            <button
              className={styles.pageBtn}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              PREVIOUS
            </button>
            <button
              className={styles.pageBtn}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              NEXT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default React.memo(DataTable);
