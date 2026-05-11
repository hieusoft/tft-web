'use client';

import React, { useEffect, useState } from 'react';
import { fetchGodDetailAction } from './actions'; 
import type { ApiGodDetail } from '@/lib/api-client';

export default function GodDetailModal({ godSlug, onClose }: { godSlug: string; onClose: () => void }) {
  const [god, setGod] = useState<ApiGodDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const data = await fetchGodDetailAction(godSlug); 
      setGod(data);
      setLoading(false);
    };
    fetchDetail();
  }, [godSlug]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative bg-[#1e1e20] border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {loading ? (
          <div className="p-12 text-center text-white animate-pulse">Đang tải thông tin...</div>
        ) : god ? (
          <>
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-[#1a1a1c]">
              <div className="flex items-center gap-4">
                <img src={god.image} alt={god.name} className="w-14 h-14 rounded-full border border-gray-500" />
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {god.name}
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-bold">Tier {god.rank}</span>
                  </h2>
                  <p className="text-gray-400 text-sm">{god.trait}</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              
              {god.augment && (
                <div className="mb-6 bg-[#252527] p-4 rounded-lg border border-gray-700/50 flex gap-4 items-start">
                  <img src={god.augment.image} alt="Augment" className="w-12 h-12 rounded border border-gray-600" />
                  <div>
                    <h4 className="text-yellow-500 font-bold text-xs uppercase tracking-wider mb-1">Lõi Ân Huệ</h4>
                    <p className="text-white font-semibold text-sm mb-1">{god.augment.name}</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{god.augment.description}</p>
                  </div>
                </div>
              )}

              <h3 className="text-white font-bold mb-3">Phần Thưởng Giai Đoạn</h3>
              <div className="space-y-4">
                {god.stages?.map((stageObj, idx) => (
                  <div key={idx} className="bg-[#252527] rounded-lg border border-gray-700/50 overflow-hidden">
                    <div className="bg-gray-800/80 px-4 py-2 text-xs font-bold text-gray-300 border-b border-gray-700/50">
                      {stageObj.stage}
                    </div>
                    <div className="p-4 flex flex-col gap-4">
                      {stageObj.rewards.map((reward, rIdx) => {
                        const parts = reward.text.split(': ');
                        const hasTitle = parts.length > 1;
                        
                        return (
                          <div key={rIdx} className="flex gap-3 items-center">
                            <img src={reward.icon} alt="Reward" className="w-8 h-8 rounded border border-gray-700" />
                            <div className="text-xs text-gray-300">
                               {hasTitle ? (
                                 <>
                                  <span className="text-amber-200 font-semibold">{parts[0]}: </span>
                                  {parts.slice(1).join(': ')}
                                 </>
                               ) : (
                                 reward.text
                               )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-red-400">Không tìm thấy dữ liệu.</div>
        )}
      </div>
    </div>
  );
}