'use client';

import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { SectionLoader } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { cn } from '@/lib/utils/cn';

export interface Column<T> {
  key:        string;
  header:     string;
  cell:       (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns:          Column<T>[];
  data:             T[];
  isLoading?:       boolean;
  emptyTitle?:      string;
  emptyDescription?: string;
  className?:       string;
  onRowClick?:      (row: T) => void;
}

export function DataTable<T>({
  columns, data, isLoading,
  emptyTitle = 'No results', emptyDescription,
  className, onRowClick,
}: DataTableProps<T>) {
  if (isLoading) return <SectionLoader />;
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className="my-8" />;
  }
  return (
    <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            {columns.map((col) => (
              <TableHead key={col.key} className={cn('font-semibold', col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow
              key={i}
              onClick={() => onRowClick?.(row)}
              className={cn(onRowClick && 'cursor-pointer')}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={col.className}>
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}