import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { PointData } from '../types/point-data';

export default function PointHoverWindow({ mousePos, hovered }: { mousePos: { x: number; y: number }; hovered: PointData }) {
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    // Reset when hovered point changes
    setImgSize(null);
  }, [hovered.image]);

  const fallback = { w: 384, h: 192 };
  const naturalW = imgSize?.w || fallback.w;
  const naturalH = imgSize?.h || fallback.h;
  const maxW = 240;
  const scale = naturalW > maxW ? maxW / naturalW : 1;
  const w = Math.round(naturalW * scale);
  const h = Math.round(naturalH * scale);

  return (
    <div
      className="flex flex-col fixed bg-[#202020] gap-2 p-4 rounded-xl z-50 text-white pointer-events-none"
      style={{ left: mousePos.x + 12, top: mousePos.y + 12, width: w }}
    >
      <div className="font-semibold text-xl truncate" title={hovered.name}>{hovered.name}</div>

      {hovered.image && (
        <Image
          src={hovered.image}
          alt={hovered.image_alt}
          width={w}
          height={h}
          onLoad={(e) => setImgSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
          className="rounded-md"
        />
      )}

      {hovered.desc && <div className="opacity-80 text-sm line-clamp-4" title={hovered.desc}>{hovered.desc}</div>}

      <div className="opacity-50 mt-2 text-xs">
        lat {hovered.lat.toFixed(2)}, lng {hovered.lng.toFixed(2)}
      </div>
    </div>
  )
}
