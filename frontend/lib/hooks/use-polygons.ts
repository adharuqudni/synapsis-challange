import { useState, useEffect } from 'react';
import { savePolygon } from '../api';

interface Point {
  x: number;
  y: number;
}

interface Polygon {
  id: string;
  points: Point[];
}

export function usePolygons() {
  const [polygons, setPolygons] = useState<Polygon[]>([]);

  
  const fetchPolygons = async () => {
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/config/area/latest',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch polygons');

      const data = await response.json();
      const coordinates = JSON.parse(data.coordinates);
      
      const formattedPolygons: Polygon[] = [
        {
          id: data.id,
          points: coordinates.map(([x, y]: [number, number]) => ({ x, y })),
        },
      ];

      setPolygons(formattedPolygons);
    } catch (error) {
      console.error('Error fetching polygons:', error);
    }
  };

  useEffect(() => {
    fetchPolygons();
  }, []);

  const addPolygon = async (polygon: Polygon) => {
    
    await savePolygon(polygon.points.map((val) => [Math.round(val.x), Math.round(val.y)]));
    setPolygons([polygon]);
  };

  const updatePolygon = (id: string, points: Point[]) => {
    setPolygons(polygons.map((p) => (p.id === id ? { ...p, points } : p)));
  };

  return {
    polygons,
    addPolygon,
    updatePolygon,
  };
}
