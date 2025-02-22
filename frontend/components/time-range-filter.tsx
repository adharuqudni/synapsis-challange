'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTimeRangeStore } from '@/lib/hooks/use-timerange';

export function TimeRangeFilter() {
  const { setTimeRange } = useTimeRangeStore();

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 3);
    return date.toISOString().slice(0, 16);
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().slice(0, 16);
  });

  const handleFilter = async () => {
    setTimeRange({
      startDate: startDate,
      endDate: endDate,
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Time Range Filter</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="start-date">Start Date</Label>
          <input
            id="start-date"
            type="datetime-local"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="end-date">End Date</Label>
          <input
            id="end-date"
            type="datetime-local"
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div className="grid">
        <Button onClick={handleFilter}>Apply Filter</Button>
      </div>
    </div>
  );
}
