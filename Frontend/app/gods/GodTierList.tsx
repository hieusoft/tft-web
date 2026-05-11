'use client';

import React, { useState } from 'react';
import GodDetailModal from './GodDetailModal';
import type { ApiGodListItem } from '@/lib/api-client';

const RANK_COLORS: Record<string, string> = {
  S: "bg-[#f59e8b] text-[#5c2b29]", 
  A: "bg-[#f7b973] text-[#5c3716]",
  B: "bg-[#fcd34d] text-[#5c4b16]", 
  C: "bg-[#a3e635] text-[#2c4714]", 
  D: "bg-[#4ade80] text-[#144723]", 
};

const GodCard = ({ god, onClick }: { god: ApiGodListItem; onClick: (slug: string) => void }) => {
  return (
    <div 
      className="flex flex-col items-center justify-start w-[80px] cursor-pointer group"
      onClick={() => onClick(god.slug ?? String(god.id))}
    >
      <div className="relative mb-2 transition-transform duration-200 group-hover:-translate-y-1">
        <img loading="lazy" 
          src={god.image} 
          alt={god.name} 
          className="w-14 h-14 rounded-full object-cover border-2 border-transparent group-hover:border-yellow-400 shadow-md"
        />
      </div>
      <span className="text-white text-xs font-semibold text-center leading-tight whitespace-nowrap">
        {god.name}
      </span>
      <span className="text-gray-400 text-[10px] text-center leading-tight mt-0.5 whitespace-nowrap">
        {god.trait}
      </span>
    </div>
  );
};

export default function GodTierList({ initialGods }: { initialGods: ApiGodListItem[] }) {
  const [selectedGodSlug, setSelectedGodSlug] = useState<string | null>(null);

  const tiers = ['S', 'A', 'B', 'C', 'D'];
  const groupedData = tiers.map(tier => ({
    tier,
    color: RANK_COLORS[tier] || "bg-gray-500 text-white",
    gods: initialGods.filter(god => god.rank === tier)
  }));

  return (
    <div className="bg-[#121212] min-h-screen p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-white mb-2">Danh Sách Tầng Thần Thoại</h1>
          <p className="text-gray-400 text-sm">
            Các Thần cung cấp những Ân huệ độc đáo và các đề nghị theo giai đoạn. Nhấp vào một vị thần để xem ân huệ và các đề nghị của họ.
          </p>
        </div>

        <div className="flex flex-col gap-[2px]">
          {groupedData.map((row) => (
            <div key={row.tier} className="flex min-h-[100px] bg-[#1e1e20] rounded-sm overflow-hidden">
              <div className={`w-20 flex-shrink-0 flex items-center justify-center font-black text-2xl ${row.color}`}>
                {row.tier}
              </div>

              <div className="flex-1 p-4 flex flex-wrap gap-x-6 gap-y-4 items-center bg-[#252527]">
                {row.gods.length > 0 ? (
                  row.gods.map(god => (
                    <GodCard key={god.id} god={god} onClick={setSelectedGodSlug} />
                  ))
                ) : (
                  <span className="text-gray-600 italic text-sm">Chưa có dữ liệu</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedGodSlug && (
        <GodDetailModal 
          godSlug={selectedGodSlug} 
          onClose={() => setSelectedGodSlug(null)} 
        />
      )}
    </div>
  );
}