'use client';

import Globe from 'react-globe.gl';
import { smallGlobeData } from '@/app/_mock/pointsData';
import { useEffect, useState } from 'react';

import PointHoverWindow from './point-hover-window';
import PointPopupWindow from './point-popup-window';

import type { PointData } from '@/types/point-data';

export default function DreamGlobe() {
  const [points, setPoints] = useState<PointData[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hovered, setHovered] = useState<PointData | null>(null);
  const [clicked, setClicked] = useState<PointData | null>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({ x: event.clientX, y: event.clientY });
  };

  function onPointClick(point: PointData) {
    setClicked(point);
    // Clear hover when a point is clicked so the hover window hides
    setHovered(null);
  }

  function onPointHover(point: PointData | null) {
    setHovered(point);
  }

  useEffect(() => {
    const fetchData = async () => { };

    fetchData();

    setPoints(smallGlobeData);
  }, []);

  return (
    <div className="w-screen h-screen" onMouseMove={handleMouseMove}>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="#202020"
        animateIn={true}
        pointsData={points}
        pointLabel={""}
        onPointClick={(point) => onPointClick(point as PointData)}
        onPointHover={(point) => onPointHover(point as PointData | null)}
      />
      {hovered && (
        <PointHoverWindow mousePos={mousePos} hovered={hovered} />
      )}
      {clicked && (
        <PointPopupWindow point={clicked} onClose={() => setClicked(null)} />
      )}
    </div>
  );
}
