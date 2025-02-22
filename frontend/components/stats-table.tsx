import { useState, useEffect } from 'react';
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
  PaginationEllipsis,
} from '@/components/ui/pagination';

import _ from 'lodash';
import { useTimeRangeStore } from '@/lib/hooks/use-timerange';

type Person = {
  id: number;
  cx: number;
  cy: number;
  detected_at: string;
};

type Stat = {
  id: number;
  track_id: number;
  event: 'enter' | 'exit';
  timestamp: string;
  person: Person;
};

type ApiResponse = {
  data: Stat[];
  count: number;
  current_page: number;
  limit: number;
  total_pages: number;
};

const StatsTable = () => {
  const [data, setData] = useState<Stat[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [maxPage, setMaxPage] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const { timeRange } = useTimeRangeStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/stats/?page=${currentPage}&limit=${limit}&start_date=${timeRange.startDate}&end_date=${timeRange.endDate}`
        );
        const result: ApiResponse = await response.json();
        setData(result.data);
        setMaxPage(result.total_pages);
        setCurrentPage(result.current_page);
        setLimit(result.limit);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [currentPage, limit, timeRange.endDate, timeRange.startDate]);

  return (
    <div>
      <Table>
        <TableCaption>Recent tracking logs.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Track ID</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead className="text-right">Person (cx, cy)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((stat) => (
            <TableRow key={stat.id}>
              <TableCell>{stat.id}</TableCell>
              <TableCell>{stat.track_id}</TableCell>
              <TableCell>{stat.event}</TableCell>
              <TableCell>{new Date(stat.timestamp).toLocaleString()}</TableCell>
              <TableCell className="text-right">
                ({stat.person.cx}, {stat.person.cy})
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            />
          </PaginationItem>

          {_.range(currentPage, currentPage + 3).map((num) => (
            <PaginationItem key={num}>
              <PaginationLink
                href="#"
                onClick={() => setCurrentPage(num)}
                className={num === currentPage ? 'font-bold' : ''}
              >
                {num}
              </PaginationLink>
            </PaginationItem>
          ))}

          {maxPage > 5 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => setCurrentPage((prev) => prev + 1)}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default StatsTable;
