'use client';

import Globe from 'react-globe.gl';
import { useEffect, useState } from 'react';
import type { PointData } from '@/types/point-data';
import PointHoverWindow from './point-hover-window';
import PointPopupWindow from './point-popup-window';

interface ArcData {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: [string, string];
}

export default function DreamGlobe() {
  const [points, setPoints] = useState<PointData[]>([]);
  const [arcs, setArcs] = useState<ArcData[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<PointData | null>(null);
  const [clicked, setClicked] = useState<PointData | null>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: event.clientX, y: event.clientY });
  };

  const onPointClick = (point: PointData) => {
    setClicked(point);
    setHovered(null);
  };

  const onPointHover = (point: PointData | null) => {
    setHovered(point);
  };

  // Fetch points from API
  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await fetch('/api/backend/dreams');
        if (!res.ok) throw new Error('Failed to fetch points');
        const data: PointData[] = await res.json();
        setPoints(data);

        // Create arcs between consecutive points
        const arcsData: ArcData[] = data.slice(1).map((point, i) => ({
          startLat: data[i].lat,
          startLng: data[i].lng,
          endLat: point.lat,
          endLng: point.lng,
          color: ['red', 'orange'] as [string, string],
        }));
        setArcs(arcsData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPoints();
  }, []);

  return (
    <div className="w-screen h-screen" onMouseMove={handleMouseMove}>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="#000000"
        animateIn={true}
        pointsData={points}
        pointLat={(d) => (d as PointData).lat}
        pointLng={(d) => (d as PointData).lng}
        pointColor={() => 'red'}
        pointRadius={0.5}
        onPointClick={(point) => onPointClick(point as PointData)}
        onPointHover={(point) => onPointHover(point as PointData | null)}
        arcsData={arcs}
        arcStartLat={(d) => (d as ArcData).startLat}
        arcStartLng={(d) => (d as ArcData).startLng}
        arcEndLat={(d) => (d as ArcData).endLat}
        arcEndLng={(d) => (d as ArcData).endLng}
        arcDashLength={() => 0.5}
        arcDashGap={() => 0.5}
        arcDashAnimateTime={() => 2000}
      />
      {hovered && <PointHoverWindow mousePos={mousePos} hovered={hovered} />}
      {clicked && <PointPopupWindow point={clicked} onClose={() => setClicked(null)} />}
    </div>
  );
}
