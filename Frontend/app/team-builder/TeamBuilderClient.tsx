"use client";

import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ApiChampionOverview } from "@/app/champions/ChampionsClient";
import type { ApiItem } from "@/lib/api-client";
import type { ApiTrait } from "@/lib/api-client";

// ── HEX CONSTANTS ─────────────────────────────────────────────────────────────
const B_COLS = 7, B_ROWS = 4;
const B_HW = 96, B_HH = 110, B_GAP = 8;
const B_STEP = Math.round(B_HH * 0.75) + 4;
const B_NAT_W = B_COLS * (B_HW + B_GAP) - B_GAP + Math.round(B_HW / 2) + B_GAP;
const B_NAT_H = (B_ROWS - 1) * B_STEP + B_HH + 12;
const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

const COST_BORDER: Record<number, string> = {
  1: "#6b7280", 2: "#22c55e", 3: "#3b82f6", 4: "#a855f7", 5: "#f59e0b",
};
const COST_BG: Record<number, string> = {
  1: "#374151", 2: "#14532d", 3: "#1e3a5f", 4: "#3b1764", 5: "#713f12",
};

interface BoardSlot {
  champ: ApiChampionOverview;
  items: ApiItem[];
}

function getActualTraitStyle(count: number, trait?: ApiTrait): number {
  if (!trait || !trait.milestones || trait.milestones.length === 0) return count > 0 ? 1 : 0;
  
  const reqs = trait.milestones.map(ms => {
    if (typeof ms === 'number') return ms;
    const anyMs = ms as any;
    return anyMs.min_units || anyMs.unit || anyMs.min || 0;
  }).filter(u => u > 0);
  
  if (reqs.length === 0) return count > 0 ? 1 : 0;
  
  reqs.sort((a, b) => a - b);
  
  let activeIndex = -1;
  for (let i = reqs.length - 1; i >= 0; i--) {
    if (count >= reqs[i]) {
      activeIndex = i;
      break;
    }
  }
  
  if (activeIndex === -1) return 0;
  
  const totalChamps = trait.champions ? trait.champions.length : 0;
  const maxReq = reqs[reqs.length - 1];
  const requiresEmblem = totalChamps > 0 && maxReq > totalChamps;
  const N = reqs.length;
  
  if (activeIndex === N - 1) return requiresEmblem ? 4 : 3;
  if (activeIndex === 0) return 1;
  
  if (N === 4) {
    if (activeIndex === 1) return 2;
    if (activeIndex === 2) return 3;
  }
  if (N === 5) {
    if (activeIndex === 1) return 1;
    if (activeIndex === 2) return 2;
    if (activeIndex === 3) return 3;
  }
  return 2;
}

function getTraitStyle(style: number) {
  if (style === 0) return { bg: "#111", color: "#6b7280" };
  if (style >= 4) return { bg: "linear-gradient(135deg, #a855f7, #06b6d4)", color: "#fff" };
  if (style === 3) return { bg: "linear-gradient(135deg, #fbbf24, #d97706)", color: "#fff" };
  if (style === 2) return { bg: "linear-gradient(135deg, #9ca3af, #6b7280)", color: "#fff" };
  return { bg: "linear-gradient(135deg, #b45309, #78350f)", color: "#fff" };
}

function getTraitStyleColor(style: number) {
  if (style === 0) return "#6b7280";
  if (style >= 4) return "#06b6d4";
  if (style === 3) return "#fbbf24";
  if (style === 2) return "#9ca3af";
  return "#b45309";
}

function parseTraitDescription(description: string | null | undefined, milestones: any[]) {
  let desc = description || "";
  const effects: Record<number, string> = {};
  
  if (!desc || !milestones || milestones.length === 0) return { desc, effects };
  
  const hasEffects = milestones.some(ms => ms.effect);
  if (hasEffects) {
     milestones.forEach(ms => {
       const u = typeof ms === 'number' ? ms : (ms.min_units || ms.unit || ms.min || 0);
       effects[u] = ms.effect || "";
     });
     return { desc, effects };
  }
  
  const reqUnits = milestones.map(ms => typeof ms === 'number' ? ms : (ms.min_units || ms.unit || ms.min || 0)).filter(u => u > 0);
  if (reqUnits.length === 0) return { desc, effects };

  let regexStr = "";
  reqUnits.forEach(u => {
    regexStr += `\\(${u}\\)(.*?)`;
  });
  regexStr = regexStr.slice(0, -5) + "(.*)$";
  
  try {
    const regex = new RegExp(regexStr, "s");
    const match = desc.match(regex);
    if (match) {
      const startIndex = desc.lastIndexOf(match[0]);
      if (startIndex !== -1) {
        const mainDesc = desc.substring(0, startIndex).trim();
        reqUnits.forEach((u, i) => {
          let text = match[i + 1].trim();
          if (i === reqUnits.length - 1) {
              text = text.replace(/^[,.]+|[,.]+$/g, '').trim(); 
          }
          effects[u] = text;
        });
        return { desc: mainDesc, effects };
      }
    }
  } catch (e) {}
  
  return { desc, effects };
}

function ActiveTraitRow({ t, style, compChampIds }: { t: any; style: any; compChampIds: Set<number> }) {
  const [showTip, setShowTip] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTip) return;
    const handler = (e: MouseEvent) => {
      if (tipRef.current && !tipRef.current.contains(e.target as Node)) setShowTip(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTip]);

  const parsedTrait = useMemo(() => {
    if (!t.traitData) return { desc: "", effects: {} };
    return parseTraitDescription(t.traitData.description, t.traitData.milestones || []);
  }, [t.traitData]);

  const styleColor = getTraitStyleColor(t.styleId);

  return (
    <div ref={tipRef} style={{ position: 'relative' }}>
      <div 
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onClick={() => setShowTip(!showTip)}
        style={{ 
          display: "flex", alignItems: "center", gap: 12, backgroundColor: "#222232", 
          padding: "8px 12px", borderRadius: 8, opacity: t.styleId === 0 ? 0.6 : 1,
          cursor: 'pointer'
        }}
      >
        <div style={{ width: 24, height: 24, background: style.bg, clipPath: HEX_CLIP, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {t.image && <img src={t.image} alt={t.name} style={{ width: 14, height: 14, filter: t.styleId === 0 ? 'grayscale(100%) opacity(0.5)' : 'drop-shadow(0 1px 1px black)' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.styleId === 0 ? "#888" : "#fff" }}>{t.name}</div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 900, color: t.styleId === 0 ? "#888" : "#f0b90b" }}>{t.count}</div>
      </div>

      {showTip && t.traitData && (
        <div style={{
          position: 'absolute', top: '0', left: '105%',
          background: '#1a1a2e', border: '1px solid #333', borderRadius: 8,
          padding: '10px 12px', width: 280, zIndex: 100,
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {t.image && <img loading="lazy" src={t.image} alt="" style={{ width: 18, height: 18 }} />}
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8e8e8' }}>{t.name}</span>
            <span style={{ fontSize: '0.65rem', color: styleColor, marginLeft: 'auto', fontWeight: 600 }}>
              Bậc {t.styleId} ({t.count})
            </span>
          </div>
          
          {parsedTrait.desc && (
            <div style={{ fontSize: '0.65rem', color: '#aaa', lineHeight: 1.4, marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: parsedTrait.desc }} />
          )}

          {t.traitData.milestones && t.traitData.milestones.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {t.traitData.milestones.map((ms: any, i: number) => {
                const reqUnit = typeof ms === 'number' ? ms : (ms.min_units || ms.unit || ms.min || 0);
                const effect = parsedTrait.effects[reqUnit] || "";
                const isMilestoneActive = t.count >= reqUnit;
                return (
                  <div key={i} style={{ display: 'flex', gap: 6, opacity: isMilestoneActive ? 1 : 0.4 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isMilestoneActive ? styleColor : '#888', whiteSpace: 'nowrap' }}>
                      ({reqUnit})
                    </span>
                    {effect && (
                      <span style={{ fontSize: '0.65rem', color: isMilestoneActive ? '#eee' : '#aaa', lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: effect }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {t.traitData.champions && t.traitData.champions.length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #333' }}>
              <div style={{ fontSize: '0.55rem', color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tướng</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {t.traitData.champions.map((c: any) => {
                  const cBorderColor = COST_BORDER[c.cost] || '#666';
                  const inComp = compChampIds.has(c.id);
                  return (
                    <div key={c.id} style={{ 
                      width: 24, height: 24, borderRadius: 3, border: `1px solid ${cBorderColor}`, overflow: 'hidden',
                      opacity: inComp ? 1 : 0.25, filter: inComp ? 'none' : 'grayscale(100%)'
                    }}>
                      {c.icon_path ? (
                        <img loading="lazy" src={c.icon_path} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#222', fontSize: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {c.name.substring(0, 2)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatSkillDescription(desc: string) {
  if (!desc) return '';
  let formatted = desc.replace(/\s*\(\s*\)/g, '');
  
  // 1. Numbers placeholder (handle numbers, fractions, percentages)
  formatted = formatted.replace(/(\d+(?:\.\d+)?(?:%\s*)?(?:\/\d+(?:\.\d+)?(?:%\s*)?)*)/g, '[[NUM:$1]]');
  
  // 2. Sentences (break lines after a period/exclamation/question mark followed by space and an uppercase letter)
  formatted = formatted.replace(/([\.!?])\s+(?=\p{Lu})/gu, '$1<br/><br/>');
  
  // 3. Key-Value pairs (e.g. "Sát Thương Chém: 140/210/315")
  formatted = formatted.replace(/(?:Sát Thương|Giảm|Hồi|Tốc|Thời|Sát thương|Năng lượng|Máu)(?:\s+[\p{L}\s\.]+?)?:/gu, match => `<br/><span style="color: #f0b90b; font-weight: 600;">${match}</span>`);

  // Fix consecutive line breaks if the key-value matched immediately after a sentence
  formatted = formatted.replace(/(<br\/>\s*){3,}/g, '<br/><br/>');

  // 4. Terms
  const terms = [
    { regex: /(sát thương vật lý)/gi, color: '#f97316' },
    { regex: /(sát thương phép thuật|sát thương phép)/gi, color: '#3b82f6' },
    { regex: /(sát thương chuẩn)/gi, color: '#e2e8f0' },
    { regex: /(hồi máu|hồi phục)/gi, color: '#22c55e' },
    { regex: /(giáp)/gi, color: '#eab308' },
    { regex: /(kháng phép)/gi, color: '#06b6d4' },
    { regex: /(lá chắn|khiên)/gi, color: '#fbbf24' },
    { regex: /(tốc độ đánh|tốc đánh)/gi, color: '#fb923c' },
    { regex: /(năng lượng)/gi, color: '#60a5fa' },
    { regex: /(máu)/gi, color: '#ef4444' },
    { regex: /(sức mạnh phép thuật|smpt)/gi, color: '#8b5cf6' },
    { regex: /(làm choáng|hất tung|hoảng sợ)/gi, color: '#a8a29e' },
  ];
  terms.forEach(({ regex, color }) => {
    formatted = formatted.replace(regex, `<span style="color: ${color}; font-weight: 600;">$1</span>`);
  });

  // 5. Restore numbers
  formatted = formatted.replace(/\[\[NUM:(.*?)\]\]/g, '<span style="color: #fff; font-weight: 700;">$1</span>');

  // Remove leading breaks
  formatted = formatted.replace(/^(<br\/>\s*)+/, '');

  return formatted;
}

function useTooltipLogic() {
  const [showTip, setShowTip] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTip || !ref.current) return;
    
    const updateRect = () => {
      if (ref.current) setRect(ref.current.getBoundingClientRect());
    };
    updateRect();

    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowTip(false);
    };
    document.addEventListener('mousedown', handler);
    
    return () => {
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
      document.removeEventListener('mousedown', handler);
    };
  }, [showTip]);

  return { showTip, setShowTip, rect, ref };
}

function ChampTooltip({ champ, position = 'top', traitImages, rect }: { champ: any, position?: 'top' | 'bottom', traitImages: Record<string, string>, rect?: DOMRect | null }) {
  const borderColor = COST_BORDER[champ.cost] ?? '#6b7280';
  
  const style: React.CSSProperties = {
    background: '#1a1a2e', border: '1px solid #333', borderRadius: 8,
    padding: '10px 12px', minWidth: 260, maxWidth: 320, zIndex: 100000,
    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
    pointerEvents: 'none',
    display: 'flex', flexDirection: 'column', gap: 6,
  };

  if (rect) {
    style.position = 'fixed';
    style.left = rect.left + rect.width / 2;
    if (position === 'top') {
      style.top = rect.top - 10;
      style.transform = 'translate(-50%, -100%)';
    } else {
      style.top = rect.bottom + 10;
      style.transform = 'translate(-50%, 0)';
    }
  } else {
    style.position = 'absolute';
    if (position === 'top') {
      style.bottom = '100%';
      style.left = '50%';
      style.transform = 'translate(-50%, -10px)';
    } else {
      style.top = '100%';
      style.left = '50%';
      style.transform = 'translate(-50%, 10px)';
    }
  }

  const content = (
    <div style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 4, border: `2px solid ${borderColor}`, overflow: 'hidden' }}>
          {champ.icon_path ? (
            <img loading="lazy" src={champ.icon_path} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#222' }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8e8e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{champ.name}</div>
          <div style={{ fontSize: '0.6rem', color: borderColor, fontWeight: 600 }}>{champ.cost} Vàng</div>
        </div>
      </div>
      
      {champ.traits && champ.traits.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
          {champ.traits.map((t: any, i: number) => {
            const tImg = t.image || traitImages[t.slug];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {tImg && <img loading="lazy" src={tImg} alt="" style={{ width: 14, height: 14 }} />}
                <span style={{ fontSize: '0.6rem', color: '#ccc' }}>{t.name}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {champ.skill && (
        <div style={{ marginTop: 4, paddingTop: 6, borderTop: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {champ.skill.icon_path && (
              <img loading="lazy" src={champ.skill.icon_path} alt="" style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #444' }} />
            )}
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f0b90b' }}>{champ.skill.name}</div>
              {(champ.skill.mana_start !== undefined && champ.skill.mana_max !== undefined) && (
                <div style={{ fontSize: '0.55rem', color: '#66abff' }}>
                  Năng lượng: {champ.skill.mana_start} / {champ.skill.mana_max}
                </div>
              )}
            </div>
          </div>
          {champ.skill.description && (
            <div style={{ fontSize: '0.6rem', color: '#aaa', lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: formatSkillDescription(champ.skill.description) }} />
          )}
        </div>
      )}
    </div>
  );

  if (rect && typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
}

function PoolChampItem({ champ, onDragStart, traitImages }: { champ: any; onDragStart: any; traitImages: Record<string, string> }) {
  const { showTip, setShowTip, rect, ref } = useTooltipLogic();

  return (
    <div 
      ref={ref}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => setShowTip(!showTip)}
      style={{ position: "relative" }}
    >
      {showTip && <ChampTooltip champ={champ} position="top" traitImages={traitImages} rect={rect} />}
      <div 
        draggable 
        onDragStart={(e) => { setShowTip(false); onDragStart(e, champ); }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "grab" }}
      >
        <div style={{ width: 50, height: 50, borderRadius: 8, overflow: "hidden", border: `2px solid ${COST_BORDER[champ.cost] || '#6b7280'}`, position: "relative" }}>
          {champ.icon_path && <Image src={champ.icon_path} alt={champ.name} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#e8e8e8", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>{champ.name}</div>
      </div>
    </div>
  );
}

function BoardChamp({ slot, ri, ci, onDragStart, traitImages }: { slot: any; ri: number; ci: number; onDragStart: any; traitImages: Record<string, string> }) {
  const { showTip, setShowTip, rect, ref } = useTooltipLogic();

  return (
    <div 
      ref={ref}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => setShowTip(!showTip)}
      style={{ position: 'absolute', inset: 0, zIndex: showTip ? 50 : 1 }}
    >
      {showTip && <ChampTooltip champ={slot.champ} position={ri < 2 ? "bottom" : "top"} traitImages={traitImages} rect={rect} />}
      <div 
        draggable
        onDragStart={(e) => { setShowTip(false); e.stopPropagation(); onDragStart(e, ri, ci, slot); }}
        style={{
          position: "absolute", inset: 0, clipPath: HEX_CLIP,
          background: `linear-gradient(to bottom, ${COST_BORDER[slot.champ.cost]}, ${COST_BG[slot.champ.cost]})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab'
        }}
      >
        <div style={{ position: "absolute", inset: 3, clipPath: HEX_CLIP, backgroundColor: COST_BG[slot.champ.cost], overflow: "hidden" }}>
          {(slot.champ.splash_path || slot.champ.icon_path) && (
            <Image src={slot.champ.splash_path || slot.champ.icon_path} alt={slot.champ.name} fill style={{ objectFit: 'cover', objectPosition: '90% 15%', transform: 'scale(1.3)' }} unoptimized draggable={false} />
          )}
          <div style={{ position: "absolute", bottom: 26, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.75)", fontSize: 11, fontWeight: 800, textAlign: "center", padding: "2px 0", color: "#fff" }}>
            {slot.champ.name}
          </div>
        </div>
      </div>
    </div>
  );
}

function ItemTooltip({ item, position = 'top', rect }: { item: any, position?: 'top' | 'bottom', rect?: DOMRect | null }) {
  const iImg = item.image || item.icon_path;
  
  const style: React.CSSProperties = {
    background: '#1a1a2e', border: '1px solid #333', borderRadius: 8,
    padding: '10px 12px', width: 220, zIndex: 100000,
    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
    pointerEvents: 'none',
    display: 'flex', flexDirection: 'column', gap: 8,
  };

  if (rect) {
    style.position = 'fixed';
    style.left = rect.left + rect.width / 2;
    if (position === 'top') {
      style.top = rect.top - 10;
      style.transform = 'translate(-50%, -100%)';
    } else {
      style.top = rect.bottom + 10;
      style.transform = 'translate(-50%, 0)';
    }
  } else {
    style.position = 'absolute';
    if (position === 'top') {
      style.bottom = '100%';
      style.left = '50%';
      style.transform = 'translate(-50%, -10px)';
    } else {
      style.top = '100%';
      style.left = '50%';
      style.transform = 'translate(-50%, 10px)';
    }
  }

  const content = (
    <div style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 4, overflow: 'hidden', border: '1px solid #555', flexShrink: 0 }}>
          {iImg && <img loading="lazy" src={iImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f0b90b' }}>{item.name}</div>
      </div>
      
      {item.description && (
        <div style={{ fontSize: '0.65rem', color: '#ccc', lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: item.description }} />
      )}
    </div>
  );

  if (rect && typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
}

function PoolItemWrapper({ item, onDragStartItemPool }: { item: any, onDragStartItemPool: any }) {
  const { showTip, setShowTip, rect, ref } = useTooltipLogic();
  const iImg = item.image || item.icon_path;

  return (
    <div 
      ref={ref}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => setShowTip(!showTip)}
      style={{ position: 'relative' }}
    >
      {showTip && <ItemTooltip item={item} position="top" rect={rect} />}
      <div 
        draggable onDragStart={(e) => { setShowTip(false); onDragStartItemPool(e, item); }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "grab" }}
      >
        <div style={{ width: 44, height: 44, borderRadius: 6, overflow: "hidden", border: "1px solid #3a3d45", position: "relative" }}>
          {iImg && <Image src={iImg} alt={item.name} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />}
        </div>
      </div>
    </div>
  );
}

function BoardItemWrapper({ itm, iIdx, ri, ci, onDragStart, onContextMenu }: { itm: any; iIdx: number; ri: number; ci: number; onDragStart: any; onContextMenu: any }) {
  const { showTip, setShowTip, rect, ref } = useTooltipLogic();

  return (
    <div 
      ref={ref}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => setShowTip(!showTip)}
      style={{ position: 'relative' }}
    >
      {showTip && <ItemTooltip item={itm} position={ri < 2 ? "bottom" : "top"} rect={rect} />}
      <div 
        draggable
        onDragStart={(e) => { setShowTip(false); onDragStart(e, ri, ci, iIdx); }}
        onContextMenu={(e) => { setShowTip(false); onContextMenu(e, ri, ci, iIdx); }}
        style={{ width: 20, height: 20, borderRadius: 2, border: '1px solid #eab308', overflow: 'hidden', position: 'relative', pointerEvents: 'auto', cursor: 'grab', boxShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
      >
        <Image src={itm.image || itm.icon_path || ''} alt={itm.name} fill style={{ objectFit: 'cover' }} unoptimized draggable={false} />
      </div>
    </div>
  );
}

export default function TeamBuilderClient({ 
  champions,
  traits,
  items,
  traitImages
}: { 
  champions: ApiChampionOverview[];
  traits: ApiTrait[];
  items: ApiItem[];
  traitImages: Record<string, string>;
}) {
  const [board, setBoard] = useState<(BoardSlot | null)[][]>(
    Array.from({ length: B_ROWS }, () => Array(B_COLS).fill(null))
  );
  
  const [activeTab, setActiveTab] = useState<"champions" | "items">("champions");
  const [searchTerm, setSearchTerm] = useState("");
  const [costFilter, setCostFilter] = useState<number | null>(null);
  const [traitFilter, setTraitFilter] = useState<string>("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>("");
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [boardScale, setBoardScale] = useState(1);
  const boardWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScale = () => {
      if (!boardWrapRef.current) return;
      const available = boardWrapRef.current.clientWidth - 32; // 32px = 2×16px padding
      const scale = Math.min(1, available / B_NAT_W);
      setBoardScale(scale);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const uniqueTraitsForFilter = useMemo(() => {
    const map = new Map<string, { slug: string, name: string }>();
    traits.forEach(t => {
      if (t.name.startsWith("Chiêm Tinh")) {
        if (!map.has("chiem-tinh")) {
          map.set("chiem-tinh", { slug: "chiem-tinh", name: "Chiêm Tinh" });
        }
      } else {
        map.set(t.slug, { slug: t.slug, name: t.name });
      }
    });
    // Use 'vi' locale explicitly so SSR and client produce identical sort order
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [traits]);

  const filteredChamps = useMemo(() => {
    return champions.filter(c => {
      if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (costFilter && c.cost !== costFilter) return false;
      if (traitFilter) {
        if (traitFilter === "chiem-tinh") {
          if (!c.traits?.some(t => t.name.startsWith("Chiêm Tinh"))) return false;
        } else {
          if (!c.traits?.some(t => t.slug === traitFilter)) return false;
        }
      }
      return true;
    }).sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
  }, [champions, searchTerm, costFilter, traitFilter]);

  const itemCategories = useMemo(() => {
    const cats = new Set<string>();
    items.forEach(i => { if (i.category) cats.add(i.category); });
    return Array.from(cats);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(i => {
      if (searchTerm && !i.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (itemCategoryFilter && i.category !== itemCategoryFilter) return false;
      return true;
    });
  }, [items, searchTerm, itemCategoryFilter]);

  // Active traits calculation
  const activeTraits = useMemo(() => {
    const counts: Record<string, number> = {};
    const seenNames = new Set<string>();
    
    board.forEach(row => {
      row.forEach(slot => {
        if (!slot) return;
        
        // 1. Champion Base Traits (Unique only)
        if (!seenNames.has(slot.champ.name)) {
          seenNames.add(slot.champ.name);
          slot.champ.traits?.forEach(t => {
            counts[t.slug] = (counts[t.slug] || 0) + 1;
          });
        }
        
        // 2. Emblems from Items (Count for every item, even duplicates/same champs)
        slot.items.forEach(item => {
          const lowerName = item.name.toLowerCase();
          const isEmblem = lowerName.includes('ấn') || lowerName.includes('vương miện') || lowerName.includes('trái tim') || item.category?.toLowerCase().includes('ấn');
          
          if (isEmblem) {
            const matchingBaseTrait = [...traits]
              .map(t => t.name.split(' - ')[0])
              .sort((a, b) => b.length - a.length)
              .find(baseName => lowerName.includes(baseName.toLowerCase()));
              
            if (matchingBaseTrait) {
              const matchingTrait = traits.find(t => t.name.startsWith(matchingBaseTrait));
              if (matchingTrait) {
                counts[matchingTrait.slug] = (counts[matchingTrait.slug] || 0) + 1;
              }
            }
          }
        });
      });
    });

    return Object.entries(counts)
      .map(([slug, count]) => {
        const tImg = traitImages[slug];
        let name = slug;
        const traitData = traits.find(t => t.slug === slug);
        if (traitData) name = traitData.name;
        else champions.forEach(c => c.traits?.forEach(t => { if(t.slug === slug) name = t.name; }));
        
        const styleId = getActualTraitStyle(count, traitData);
        return { slug, name, count, image: tImg, styleId, traitData };
      })
      .sort((a, b) => {
        if (a.styleId !== b.styleId) return b.styleId - a.styleId;
        return b.count - a.count;
      });
  }, [board, champions, traits, traitImages]);

  const compChampIds = useMemo(() => {
    const ids = new Set<number>();
    board.forEach(row => {
      row.forEach(slot => {
        if (slot) ids.add(slot.champ.id);
      });
    });
    return ids;
  }, [board]);

  // ── DRAG & DROP HANDLERS ────────────────────────────────────────────────────
  const onDragStartChampPool = (e: React.DragEvent, champ: ApiChampionOverview) => {
    e.dataTransfer.setData('data', JSON.stringify({ type: 'champ_pool', champ }));
  };

  const onDragStartItemPool = (e: React.DragEvent, item: ApiItem) => {
    e.dataTransfer.setData('data', JSON.stringify({ type: 'item_pool', item }));
  };

  const onDragStartBoard = (e: React.DragEvent, r: number, c: number, slot: BoardSlot) => {
    e.dataTransfer.setData('data', JSON.stringify({ type: 'board_champ', r, c, slot }));
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDropBoard = (e: React.DragEvent, destR: number, destC: number) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('data'));
      const newBoard = [...board.map(r => [...r])];

      const checkCanEquipItem = (item: ApiItem, targetSlot: BoardSlot) => {
        const lowerName = item.name.toLowerCase();
        const isEmblem = lowerName.includes('ấn') || lowerName.includes('vương miện') || lowerName.includes('trái tim') || item.category?.toLowerCase().includes('ấn');
        
        if (isEmblem) {
          const matchingBaseTrait = [...traits]
            .map(t => t.name.split(' - ')[0])
            .sort((a, b) => b.length - a.length)
            .find(baseName => lowerName.includes(baseName.toLowerCase()));
            
          if (matchingBaseTrait) {
            const baseTraitLower = matchingBaseTrait.toLowerCase();
            
            // Check if champion natively has this trait (base name matches)
            if (targetSlot.champ.traits?.some(t => t.name.toLowerCase().includes(baseTraitLower))) {
              return false;
            }
            
            // Check if champion already has an item for this trait
            for (const existingItem of targetSlot.items) {
              const existingLower = existingItem.name.toLowerCase();
              const existingIsEmblem = existingLower.includes('ấn') || existingLower.includes('vương miện') || existingLower.includes('trái tim') || existingItem.category?.toLowerCase().includes('ấn');
              if (existingIsEmblem && existingLower.includes(baseTraitLower)) {
                return false;
              }
            }
          }
        }
        return true;
      };

      if (data.type === 'champ_pool') {
        newBoard[destR][destC] = { champ: data.champ, items: [] };
      } 
      else if (data.type === 'board_champ') {
        const temp = newBoard[destR][destC];
        newBoard[destR][destC] = data.slot;
        newBoard[data.r][data.c] = temp; // Swap
      }
      else if (data.type === 'item_pool') {
        const target = newBoard[destR][destC];
        if (target && target.items.length < 3) {
          if (checkCanEquipItem(data.item, target)) {
            target.items = [...target.items, data.item];
          }
        }
      }
      else if (data.type === 'board_item') {
        // Transfer item from one champion to another
        const sourceSlot = newBoard[data.r][data.c];
        const targetSlot = newBoard[destR][destC];
        
        if (sourceSlot && targetSlot && targetSlot.items.length < 3 && (data.r !== destR || data.c !== destC)) {
          const itemToMove = sourceSlot.items[data.itemIdx];
          if (checkCanEquipItem(itemToMove, targetSlot)) {
            const newSourceItems = [...sourceSlot.items];
            const movedItem = newSourceItems.splice(data.itemIdx, 1)[0];
            newBoard[data.r][data.c] = { ...sourceSlot, items: newSourceItems };
            targetSlot.items = [...targetSlot.items, movedItem];
          }
        }
      }
      
      setBoard(newBoard);
    } catch {}
  };

  const onDropTrash = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('data'));
      const newBoard = [...board];
      
      if (data.type === 'board_champ') {
        newBoard[data.r][data.c] = null;
        setBoard(newBoard);
      } else if (data.type === 'board_item') {
        const slot = newBoard[data.r][data.c];
        if (slot) {
          const newItems = [...slot.items];
          newItems.splice(data.itemIdx, 1);
          newBoard[data.r][data.c] = { ...slot, items: newItems };
          setBoard(newBoard);
        }
      }
    } catch {}
  };

  const handleRightClickHex = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    const newBoard = [...board];
    newBoard[r][c] = null;
    setBoard(newBoard);
  };

  const handleRightClickItem = (e: React.MouseEvent, r: number, c: number, itemIdx: number) => {
    e.preventDefault();
    e.stopPropagation();
    const newBoard = [...board];
    const slot = newBoard[r][c];
    if (slot) {
      const newItems = [...slot.items];
      newItems.splice(itemIdx, 1);
      newBoard[r][c] = { ...slot, items: newItems };
      setBoard(newBoard);
    }
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div 
      suppressHydrationWarning
      style={{ backgroundColor: "#0d0d14", minHeight: "100vh", padding: "24px 16px", color: "#e8e8e8", fontFamily: "system-ui, sans-serif" }}
      onDragOver={onDragOver}
      onDrop={onDropTrash}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: "0 0 4px 0" }}>Tự Tạo Đội Hình</h1>
            <p style={{ color: "#aaa", fontSize: 14 }}>Kéo thả tướng và trang bị vào bàn cờ</p>
          </div>
          <button 
            onClick={() => setBoard(Array.from({ length: B_ROWS }, () => Array(B_COLS).fill(null)))}
            style={{ 
              padding: "8px 16px", backgroundColor: "#ef4444", color: "#fff", border: "none", 
              borderRadius: 6, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6
            }}
          >
            Xóa Bàn Cờ
          </button>
        </div>

        {/* 3-COLUMN LAYOUT */}
        <style>{`
          /* ── Builder Layout ── */
          .builder-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            align-items: start;
          }
          /* Default: traits-list is vertical (desktop) */
          .traits-list {
            flex-direction: column;
            flex-wrap: nowrap;
          }
          @media (min-width: 768px) {
            .builder-grid {
              grid-template-columns: auto 300px;
            }
            /* On tablet, traits panel spans both cols */
            .builder-col--traits {
              grid-column: 1 / -1;
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              gap: 8px;
              align-items: center;
              padding: 12px 16px !important;
              min-height: unset !important;
            }
            .builder-col--traits h2 {
              width: 100%;
              margin-bottom: 4px !important;
            }
            .builder-col--traits .traits-list {
              flex-direction: row;
              flex-wrap: wrap;
              gap: 8px;
            }
            .builder-col--panel {
              height: calc(100vh - 260px) !important;
              min-height: 400px;
            }
          }
          @media (min-width: 1200px) {
            .builder-grid {
              grid-template-columns: 220px auto 340px;
            }
            .builder-col--traits {
              grid-column: unset;
              flex-direction: column;
              padding: 20px !important;
              min-height: 400px !important;
            }
            .builder-col--traits h2 {
              width: auto;
              margin-bottom: 16px !important;
            }
            .builder-col--traits .traits-list {
              flex-direction: column;
              flex-wrap: nowrap;
            }
            .builder-col--panel {
              height: 80vh !important;
            }
          }

          /* ── Board: auto height when scaled ── */
          .builder-board-col {
            min-height: unset !important;
          }

          /* ── Board scroll ── */
          .builder-board-wrap {
            overflow-x: visible;
            overflow-y: visible;
          }

          /* ── Hex Wrapper z-index ── */
          .hex-wrapper:hover { z-index: 999 !important; }

          /* ── Panel on mobile: fixed bottom sheet ── */
          @media (max-width: 767px) {
            .builder-col--panel {
              position: fixed;
              bottom: 0; left: 0; right: 0;
              z-index: 200;
              border-radius: 16px 16px 0 0 !important;
              border-bottom: none !important;
              max-height: 55vh;
              box-shadow: 0 -4px 24px rgba(0,0,0,0.6);
              transition: transform 0.3s ease;
              height: 55vh !important;
            }
            .builder-col--panel.collapsed {
              transform: translateY(calc(100% - 48px));
            }
            /* Space below board to avoid overlap */
            .builder-board-col {
              margin-bottom: calc(55vh - 32px);
            }
            /* Traits panel horizontal on mobile */
            .builder-col--traits {
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              padding: 12px !important;
              gap: 6px;
              min-height: unset !important;
            }
            .builder-col--traits h2 {
              width: 100%;
              margin-bottom: 4px !important;
              font-size: 13px !important;
            }
            .builder-col--traits .traits-list {
              flex-direction: row;
              flex-wrap: wrap;
              gap: 6px;
            }
          }

          /* Active trait pill in horizontal mode */
          @media (max-width: 1199px) {
            .trait-row-compact {
              display: flex;
              align-items: center;
              gap: 6px;
              background: rgba(255,255,255,0.05);
              border-radius: 20px;
              padding: 4px 10px 4px 6px;
              border: 1px solid rgba(255,255,255,0.1);
            }
            .builder-panel-handle {
              display: flex !important;
            }
          }
          @media (min-width: 768px) {
            .builder-panel-handle {
              display: none !important;
            }
          }
          @media (min-width: 1200px) {
            .trait-row-compact {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 6px 0;
            }
          }
        `}</style>
        <div className="builder-grid">
          
          {/* COLUMN 1: TRAITS */}
          <div className="builder-col--traits" style={{ backgroundColor: "#181824", borderRadius: 12, padding: 20, border: "1px solid #2a2a3c", minHeight: 400 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: "0 0 16px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tộc Hệ Kích Hoạt</h2>
            {activeTraits.length === 0 ? (
              <p style={{ color: "#666", fontSize: 13 }}>Chưa có tướng nào.</p>
            ) : (
              <div className="traits-list" style={{ display: "flex", gap: 12 }}>
                {activeTraits.map(t => {
                  const style = getTraitStyle(t.styleId);
                  return <ActiveTraitRow key={t.slug} t={t} style={style} compChampIds={compChampIds} />;
                })}
              </div>
            )}
          </div>

          {/* COLUMN 2: BOARD */}
          <div 
            className="builder-board-col"
            ref={boardWrapRef}
            style={{ 
              backgroundColor: "#181824", borderRadius: 12, padding: "32px 16px", border: "1px solid #2a2a3c",
              display: "flex", justifyContent: "center", alignItems: "flex-start", position: "relative",
            }}
            onDragOver={onDragOver}
            onDrop={onDropTrash}
          >
            {/* Scaled board: outer container sets the scaled height so the page flows correctly */}
            <div 
              style={{ 
                width: '100%', 
                height: B_NAT_H * boardScale, 
                position: 'relative', 
                overflow: 'visible',
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <div 
                className="builder-board-inner" 
                style={{ 
                  position: 'absolute', 
                  top: 0,
                  left: 0,
                  width: B_NAT_W, 
                  height: B_NAT_H, 
                  flexShrink: 0,
                  transform: `scale(${boardScale})`,
                  transformOrigin: 'top left',
                }}
              >
              {board.map((row, ri) => 
                row.map((slot, ci) => {
                  const x = ci * (B_HW + B_GAP) + (ri % 2 === 1 ? Math.round(B_HW / 2 + B_GAP / 2) : 0);
                  const y = ri * B_STEP;
                  
                  return (
                    <div 
                      key={`${ri}-${ci}`}
                      className="hex-wrapper"
                      onDragOver={onDragOver}
                      onDrop={(e) => { e.stopPropagation(); onDropBoard(e, ri, ci); }}
                      onContextMenu={(e) => handleRightClickHex(e, ri, ci)}
                      style={{ position: 'absolute', left: x, top: y, zIndex: ri + 10, width: B_HW, height: B_HH }}
                    >
                      {/* Empty Background */}
                      <div style={{
                        position: "absolute", inset: 0, clipPath: HEX_CLIP,
                        background: 'linear-gradient(160deg, rgba(50,50,90,0.4), rgba(20,20,45,0.6))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ position: "absolute", inset: 3, clipPath: HEX_CLIP, background: 'linear-gradient(160deg, rgba(20,20,35,0.95), rgba(15,15,25,0.98))' }} />
                      </div>

                      {/* Champ in Hex */}
                      {slot && (
                        <BoardChamp slot={slot} ri={ri} ci={ci} onDragStart={onDragStartBoard} traitImages={traitImages} />
                      )}

                      {/* Items Overlay */}
                      {slot && slot.items.length > 0 && (
                        <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 2, pointerEvents: 'none', zIndex: 60 }}>
                          {slot.items.map((itm, iIdx) => (
                            <BoardItemWrapper 
                              key={iIdx} 
                              itm={itm} 
                              iIdx={iIdx} 
                              ri={ri} 
                              ci={ci} 
                              onDragStart={(e: React.DragEvent, r: number, c: number, idx: number) => {
                                e.stopPropagation();
                                e.dataTransfer.setData('data', JSON.stringify({ type: 'board_item', r, c, itemIdx: idx }));
                              }}
                              onContextMenu={handleRightClickItem}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              </div>
            </div>
          </div>

          {/* COLUMN 3: TABS (CHAMPIONS / ITEMS) */}
          <div className={`builder-col--panel${panelCollapsed ? ' collapsed' : ''}`} style={{ backgroundColor: "#181824", borderRadius: 12, padding: 20, border: "1px solid #2a2a3c", display: "flex", flexDirection: "column", height: "80vh" }}>
            {/* Mobile drag handle */}
            <div 
              onClick={() => setPanelCollapsed(c => !c)}
              style={{ display: 'none', justifyContent: 'center', paddingBottom: 12, cursor: 'pointer' }}
              className="builder-panel-handle"
            >
              <div style={{ width: 40, height: 4, borderRadius: 2, background: '#444' }} />
            </div>
            
            {/* Tabs Header */}
            <div style={{ display: "flex", borderBottom: "1px solid #2a2a3c", marginBottom: 16 }}>
              <button 
                onClick={() => setActiveTab("champions")}
                style={{ flex: 1, padding: "12px 0", background: "none", border: "none", borderBottom: activeTab === "champions" ? "2px solid #f0b90b" : "2px solid transparent", color: activeTab === "champions" ? "#f0b90b" : "#9ca3af", fontWeight: 700, cursor: "pointer" }}
              >Tướng</button>
              <button 
                onClick={() => setActiveTab("items")}
                style={{ flex: 1, padding: "12px 0", background: "none", border: "none", borderBottom: activeTab === "items" ? "2px solid #f0b90b" : "2px solid transparent", color: activeTab === "items" ? "#f0b90b" : "#9ca3af", fontWeight: 700, cursor: "pointer" }}
              >Trang Bị</button>
            </div>

            {/* Search Bar */}
            <input 
              type="text" 
              placeholder={activeTab === "champions" ? "Tìm tướng..." : "Tìm trang bị..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: "10px 16px", borderRadius: 8, backgroundColor: "#222232", border: "1px solid #3a3a4c", color: "#fff", outline: "none", width: "100%", marginBottom: 16 }}
            />

            {/* Cost & Trait Filters (Only for Champions) */}
            {activeTab === "champions" && (
              <>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  <button onClick={() => setCostFilter(null)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "1px solid", backgroundColor: costFilter === null ? "#3b82f640" : "#222232", borderColor: costFilter === null ? "#3b82f6" : "#3a3a4c", color: costFilter === null ? "#60a5fa" : "#aaa", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>Tất cả</button>
                  {[1, 2, 3, 4, 5].map(cost => (
                    <button key={cost} onClick={() => setCostFilter(cost)} style={{ flex: 1, padding: "6px", borderRadius: 6, border: "1px solid", backgroundColor: costFilter === cost ? `${COST_BORDER[cost]}40` : "#222232", borderColor: costFilter === cost ? COST_BORDER[cost] : "#3a3a4c", color: costFilter === cost ? COST_BORDER[cost] : "#aaa", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>{cost}</button>
                  ))}
                </div>
                
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <select 
                    value={traitFilter} 
                    onChange={(e) => setTraitFilter(e.target.value)}
                    style={{ flex: 1, width: "100%", padding: "8px 12px", borderRadius: 6, backgroundColor: "#222232", border: "1px solid #3a3a4c", color: "#fff", outline: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    <option value="">Tất cả Tộc / Hệ</option>
                    {uniqueTraitsForFilter.map(t => (
                      <option key={t.slug} value={t.slug}>{t.name}</option>
                    ))}
                  </select>
                  {(searchTerm || costFilter !== null || traitFilter) && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setCostFilter(null);
                        setTraitFilter("");
                      }}
                      style={{ padding: "0 12px", borderRadius: 6, backgroundColor: "#ef444420", border: "1px solid #ef4444", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                    >
                      Reset
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Item Category Filter (Only for Items) */}
            {activeTab === "items" && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <select 
                  value={itemCategoryFilter} 
                  onChange={(e) => setItemCategoryFilter(e.target.value)}
                  style={{ flex: 1, width: "100%", padding: "8px 12px", borderRadius: 6, backgroundColor: "#222232", border: "1px solid #3a3a4c", color: "#fff", outline: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                >
                  <option value="">Tất cả Phân Loại</option>
                  {itemCategories.sort().map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {(searchTerm || itemCategoryFilter) && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setItemCategoryFilter("");
                    }}
                    style={{ padding: "0 12px", borderRadius: 6, backgroundColor: "#ef444420", border: "1px solid #ef4444", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                  >
                    Reset
                  </button>
                )}
              </div>
            )}

            {/* Grid List */}
            <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
              {activeTab === "champions" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: 12 }}>
                  {filteredChamps.map(champ => (
                    <PoolChampItem key={champ.slug} champ={champ} onDragStart={onDragStartChampPool} traitImages={traitImages} />
                  ))}
                </div>
              )}

              {activeTab === "items" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))", gap: 12 }}>
                  {filteredItems.map(item => (
                    <PoolItemWrapper key={item.id} item={item} onDragStartItemPool={onDragStartItemPool} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
