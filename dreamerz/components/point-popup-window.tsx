import type { PointData } from '@/types/point-data';
export default function PointPopupWindow({ point, onClose }: { point: PointData, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex flex-col bg-[#202020] w-[800px] max-w-[90vw] h-[600px] max-h-[90vh] p-6 rounded-xl text-white shadow-lg ">
        <button
          onClick={onClose}
          className="absolute top-7 right-7 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700"
          aria-label="Close popup"
        >
          ✕
        </button>
        <div className="flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex justify-center bg-black items-center rounded-md">
            <video controls className="w-full ">
              <source src={point.video} type='video/mp4' />
            </video>
          </div>
          <div className="flex gap-2 flex-wrap">
            {point.tags.map((tag, index) => (
              <div className="bg-gray-900 py-1 px-3 rounded-full text-sm" key={index}>{tag}</div>
            ))}
          </div>
          <div className="text-xl font-semibold break-words" title={point.name}>
            {point.name}
          </div>
          <div className="leading-relaxed break-words whitespace-pre-wrap">
            {point.desc}
          </div>
        </div>
      </div>
    </div>
  )
}
