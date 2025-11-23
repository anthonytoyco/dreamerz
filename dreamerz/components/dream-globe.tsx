'use client';

import Globe from 'react-globe.gl';
import { useEffect, useState } from 'react';

interface PointData {
  name: string;
  lat: number;
  lng: number;
}

export default function DreamGlobe() {
  const [points, setPoints] = useState<PointData[]>([]);

  useEffect(() => {
    const fetchData = async () => {};

    fetchData();
  }, []);

  return (
    <>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundColor="#000000"
        animateIn={true}
        pointsData={points}
      />
    </>
  );
}
