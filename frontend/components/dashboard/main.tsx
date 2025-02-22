'use client';

import { VideoFeed } from '@/components/video-feed';
import { PeopleCounter } from '@/components/people-counter';
import { PolygonDrawer } from '@/components/polygon-drawer';
import { TimeRangeFilter } from '@/components/time-range-filter';
import { Card } from '@/components/ui/card';
import { usePolygons } from '@/lib/hooks/use-polygons';
import StatsTable from '../stats-table';

export function DashboardMain() {
  const { polygons, addPolygon, updatePolygon } = usePolygons();

  return (
    <main className="container mx-auto p-4">
      <div className="grid gap-4 md:grid-cols-2">
        
        <div className="space-y-4">
        <div className="relative">
            <VideoFeed />
            <PolygonDrawer
              polygons={polygons}
              onPolygonAdd={addPolygon}
              onPolygonUpdate={updatePolygon}
            />
          </div>
          <Card className="p-4">
            <PeopleCounter />
          </Card>
          
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <TimeRangeFilter />
          </Card>
          <Card className="p-4 mt-4">
            <StatsTable />
          </Card>
        </div>
      </div>
    </main>
  );
}
