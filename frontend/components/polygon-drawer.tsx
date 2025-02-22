'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMetadataStore } from '@/lib/hooks/use-metadata';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  id: string;
  points: Point[];
}

interface PolygonDrawerProps {
  polygons: Polygon[];
  onPolygonAdd: (polygon: Polygon) => void;
  onPolygonUpdate: (id: string, points: Point[]) => void;
}



export function PolygonDrawer({
  polygons,
  onPolygonAdd,
  // onPolygonUpdate,
}: PolygonDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const metadata = useMetadataStore((state) => state.metadata)

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = parentRef.current;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width / metadata.frame_width;
      const scaleY = canvas.height / metadata.frame_height;

      polygons.forEach((polygon) => {
        if (polygon.points.length < 2) return;

        ctx.beginPath();
        const scaledPoints = polygon.points.map((point) => ({
          x: point.x * scaleX,
          y: point.y * scaleY,
        }));

        ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
        scaledPoints.forEach((point, i) => {
          if (i > 0) ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.strokeStyle = '#00ff00';
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
        ctx.stroke();
        ctx.fill();
      });

      if (points.length > 0) {
        ctx.beginPath();
        const scaledPoints = points.map((point) => ({
          x: point.x * scaleX,
          y: point.y * scaleY,
        }));

        ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
        scaledPoints.forEach((point, i) => {
          if (i > 0) ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();

        scaledPoints.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ff0000';
          ctx.fill();
        });
      }
    };

    draw();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [polygons, points, metadata.frame_width, metadata.frame_height]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (metadata.frame_width / canvas.width);
    const y = (e.clientY - rect.top) * (metadata.frame_height / canvas.height);

    setPoints([...points, { x, y }]);
  };

  const handleSave = () => {
    if (points.length < 3) return;

    const newPolygon: Polygon = {
      id: Math.random().toString(36).substr(2, 9),
      points,
    };

    onPolygonAdd(newPolygon);
    setPoints([]);
    setIsDrawing(false);
  };

  return (
    <div ref={parentRef} className="absolute inset-0">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant={isDrawing ? 'destructive' : 'default'}
          onClick={() => {
            setIsDrawing(!isDrawing);
            if (!isDrawing) setPoints([]);
          }}
        >
          {isDrawing ? 'Cancel' : 'Draw Polygon'}
        </Button>
        {isDrawing && points.length >= 3 && (
          <Button variant="default" onClick={handleSave}>
            Save
          </Button>
        )}
      </div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
}
