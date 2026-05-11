"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import type { ApiComp, CompBoardSlot, CompActiveTrait } from "@/lib/types/comp";

// ── Types ─────────────────────────────────────────────────────────────────────
interface RecommendedItem {
  id: number;
  name: string;
  slug: string;
  image: string;
  rank_priority: number;
  pick_percent: string;
  avg_placement: string;
  win_rate: string;
  match_count: number;
}
interface ChampionItemRec {
  champion_id: number;
  champion_name: string;
  champion_slug: string;
  icon_path: string;
  recommended_items: RecommendedItem[];
}

// ── Constants ────────────────────────────────────────────────────────────────

const TIERS = ["Tất Cả", "S", "A", "B", "C"];

const TIER_CONFIG: Record<string, { bg: string; glow: string; text: string; borderColor: string }> = {
  S: { bg: "rgb(255, 126, 131)", glow: "0 0 12px rgba(255,126,131,0.4)", text: "#000", borderColor: "rgb(255, 126, 131)" },
  A: { bg: "rgb(255, 191, 127)", glow: "0 0 12px rgba(255,191,127,0.4)", text: "#000", borderColor: "rgb(255, 191, 127)" },
  B: { bg: "rgb(255, 223, 128)", glow: "0 0 12px rgba(255,223,128,0.3)", text: "#000", borderColor: "rgb(255, 223, 128)" },
  C: { bg: "rgb(254, 255, 127)", glow: "0 0 12px rgba(254,255,127,0.3)", text: "#000", borderColor: "rgb(254, 255, 127)" },
};

const COST_BORDER: Record<number, string> = {
  1: "#6b7280", 2: "#22c55e", 3: "#3b82f6", 4: "#a855f7", 5: "#f59e0b",
};

const COST_BG: Record<number, string> = {
  1: "#374151", 2: "#14532d", 3: "#1e3a5f", 4: "#3b1764", 5: "#713f12",
};

const TRAIT_STYLE_COLORS: Record<number, string> = {
  0: "#4b5563", 1: "#a16207", 2: "#9ca3af", 3: "#f59e0b", 4: "#7c3aed",
};

const PLAYSTYLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Fast: { label: "Nhanh", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  Default: { label: "Chuẩn", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  Slow: { label: "Chậm", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  "Flex": { label: "Linh Hoạt", color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
};
// ── Root Component ───────────────────────────────────────────────────────────
export default function CompsClient({ initialComps }: { initialComps: ApiComp[] }) {
  const [selectedTier, setSelectedTier] = useState("Tất Cả");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return initialComps.filter((c) => {
      if (selectedTier === "Tất Cả") return true;
      return c.tier === selectedTier;
    });
  }, [initialComps, selectedTier]);

  return (
    <div suppressHydrationWarning>
      {/* ── Page Header ── */}
      <div className="comp-page-header">
        <div className="comp-page-header__left">
          <h1 className="comp-page-title">Đội Hình Meta</h1>
          <p className="comp-page-subtitle">
            Cập nhật mới nhất · <span className="comp-page-count">{initialComps.length}</span> đội hình
          </p>
        </div>
        <div className="comp-page-header__right">
          <div className="comp-tier-filter">
            {TIERS.map((tier) => (
              <button
                id={`filter-tier-${tier}`}
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`comp-tier-btn ${selectedTier === tier ? "comp-tier-btn--active" : ""}`}
                style={
                  selectedTier === tier && tier !== "Tất Cả"
                    ? { background: TIER_CONFIG[tier]?.bg, color: TIER_CONFIG[tier]?.text }
                    : undefined
                }
                suppressHydrationWarning
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table Header ── */}
      <div className="comp-table-header">
        <div className="comp-col comp-col--tier">Tier</div>
        <div className="comp-col comp-col--name">Đội Hình</div>
        <div className="comp-col comp-col--champs">Tướng</div>
        <div className="comp-col comp-col--traits">Tộc / Hệ</div>
        <div className="comp-col comp-col--stat">T. Bình</div>
        <div className="comp-col comp-col--expand" />
      </div>

      {/* ── Comp Rows ── */}
      <div className="comp-list" style={{ border: 'none' }}>
        {filtered.map((comp) => (
          <CompRow
            key={comp.id}
            comp={comp}
            isExpanded={expandedId === comp.id}
            onToggle={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="comp-empty">
            <span className="comp-empty__icon">🔍</span>
            <p>Không tìm thấy đội hình nào cho tier này</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Comp Row ─────────────────────────────────────────────────────────────────

function CompRow({
  comp,
  isExpanded,
  onToggle,
}: {
  comp: ApiComp;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const tierCfg = TIER_CONFIG[comp.tier] ?? TIER_CONFIG.C;
  const playstyle = comp.playstyle ? PLAYSTYLE_CONFIG[comp.playstyle] : null;

  const sortedTraits = [...(comp.active_traits || [])].sort((a, b) => {
    if (a.current_style !== b.current_style) return b.current_style - a.current_style;
    return b.count - a.count;
  });

  return (
    <div className={`comp-row ${isExpanded ? "comp-row--expanded" : ""}`} data-comp-row style={{ marginBottom: 4, borderRadius: 0, overflow: 'visible' }}>
      {/* Main row */}
      <div className="comp-row__main" onClick={onToggle} style={{ borderLeft: `5px solid ${tierCfg.borderColor}`, borderRadius: 0 }}>
        <div className="comp-col comp-col--tier">
          <div
            className="comp-tier-badge"
            style={{ background: tierCfg.bg, boxShadow: tierCfg.glow, color: tierCfg.text }}
          >
            {comp.tier}
          </div>
        </div>

        <div className="comp-col comp-col--name">
          <div className="comp-name-group">
            <span className="comp-name" style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'visible', fontFamily: "'Inter', sans-serif" }}>{comp.name}</span>
            {playstyle && (
              <span className="comp-playstyle-tag" style={{ color: playstyle.color, background: playstyle.bg }}>
                {playstyle.label}
              </span>
            )}
          </div>
        </div>

        <div className="comp-col comp-col--champs">
          <div className="comp-champs" style={{ gap: 10 }}>
            {comp.final_board?.map((slot, i) => (
              <ChampionSlot key={i} slot={slot} />
            ))}
          </div>
        </div>

        <div className="comp-col comp-col--traits">
          <div className="comp-traits-mini">
            {sortedTraits.slice(0, 5).map((t) => (
              <TraitIcon key={t.id} trait={t} />
            ))}
            {sortedTraits.length > 5 && (
              <span className="comp-traits-more">+{sortedTraits.length - 5}</span>
            )}
          </div>
        </div>

        <div className="comp-col comp-col--stat">
          <span className="comp-avg-place">
            {comp.avg_placement != null ? Number(comp.avg_placement).toFixed(2) : "—"}
          </span>
        </div>

        <div className="comp-col comp-col--expand">
          <svg
            className={`comp-expand-icon ${isExpanded ? "comp-expand-icon--open" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Mobile champion strip — inline tailwind styles to ensure it only shows on mobile, passing smaller size to ChampionSlot */}
      <div className="flex md:hidden flex-wrap gap-[4px] px-[12px] py-[6px] bg-[#1a1a1a] border-t border-[#222]" onClick={onToggle}>
        {comp.final_board?.map((slot, i) => (
          <ChampionSlot key={i} slot={slot} size={42} itemSize={14} />
        ))}
      </div>

      {/* Expanded detail panel */}
      {isExpanded && (
        <CompDetail comp={comp} sortedTraits={sortedTraits} />
      )}
    </div>
  );
}


// ── Hex Board Constants ───────────────────────────────────────────────────────
const B_COLS = 7, B_ROWS = 4, B_HW = 112, B_HH = 130, B_GAP = 4;
const B_STEP = Math.round(B_HH * 0.75);
const B_NAT_W = B_COLS * (B_HW + B_GAP) - B_GAP + Math.round(B_HW / 2) + B_GAP; // ≈868
const B_NAT_H = (B_ROWS - 1) * B_STEP + B_HH + 12; // ≈448

function buildGrid(slots: CompBoardSlot[]) {
  const grid: (CompBoardSlot | null)[][] = Array.from({ length: B_ROWS }, () =>
    Array.from({ length: B_COLS }, () => null)
  );
  const hasPos = slots.some(s => s.hex != null && s.row != null);
  if (hasPos) {
    for (const slot of slots) {
      if (!slot.champion || slot.hex == null || slot.row == null) continue;
      const r = slot.row, c = slot.hex - slot.row * B_COLS;
      if (r >= 0 && r < B_ROWS && c >= 0 && c < B_COLS) grid[r][c] = slot;
    }
  } else {
    let idx = 0;
    for (let r = 0; r < B_ROWS && idx < slots.length; r++)
      for (let c = 0; c < B_COLS && idx < slots.length; c++)
        if (slots[idx]?.champion) { grid[r][c] = slots[idx]; idx++; }
  }
  return grid;
}

// HexBoard — renders the 4×7 hex grid, auto-zooms to availW
function HexBoard({ slots, availW }: { slots: CompBoardSlot[]; availW: number }) {
  const scale = availW > 40 ? Math.min(1, availW / B_NAT_W) : 1;
  const grid = buildGrid(slots);
  return (
    <div style={{ width: B_NAT_W * scale, height: B_NAT_H * scale, flexShrink: 0, overflow: 'visible' }}>
      <div style={{ position: 'relative', width: B_NAT_W, height: B_NAT_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {Array.from({ length: B_ROWS }, (_, ri) =>
          Array.from({ length: B_COLS }, (_, ci) => {
            const x = ci * (B_HW + B_GAP) + (ri % 2 === 1 ? Math.round(B_HW / 2 + B_GAP / 2) : 0);
            const y = ri * B_STEP;
            return (
              <div key={`${ri}-${ci}`} style={{ position: 'absolute', left: x, top: y, zIndex: B_ROWS - ri }}>
                <HexCell slot={grid[ri][ci]} hexW={B_HW} hexH={B_HH} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ── Shared sub-pieces ────────────────────────────────────────────────────────
const PANEL_LABEL: React.CSSProperties = { fontSize: '0.58rem', fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 };

function StatStrip({ comp, horizontal }: { comp: ApiComp; horizontal?: boolean }) {
  const avgPlace = comp.avg_placement != null ? Number(comp.avg_placement) : null;
  const stats = [
    { label: 'Vị Trí TB', value: avgPlace != null ? avgPlace.toFixed(2) : '—', color: '#e8e8e8' },
    { label: 'Top 4', value: avgPlace != null ? `${Math.max(0, Math.round((4.5 - avgPlace) * 22))}%` : '—', color: '#22c55e' },
    { label: 'Win%', value: avgPlace != null ? `${Math.max(0, Math.round((4.5 - avgPlace) * 10))}%` : '—', color: '#f0b90b' },
  ];
  if (horizontal) return (
    <div style={{ display: 'flex' }}>
      {stats.map(s => (
        <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRight: '1px solid #1a1a1a' }}>
          <div style={{ fontSize: '0.58rem', color: '#555', marginBottom: 2 }}>{s.label}</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid #2a2a4a', borderRadius: 10, padding: 10 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {stats.map(s => (
          <div key={s.label} className="detail-stat-item">
            <span className="detail-stat-item__label">{s.label}</span>
            <span className="detail-stat-item__value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AugmentList({ comp }: { comp: ApiComp }) {
  if (!comp.recommended_augments?.length) return null;
  return (
    <div>
      <div style={PANEL_LABEL}>Lõi Đề Xuất</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {comp.recommended_augments.map(aug => (
          <div key={aug.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 7px', borderRadius: 6, background: '#1a1a1e', border: '1px solid #252530' }}>
            {aug.image && <img src={aug.image} alt={aug.name} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 5, flexShrink: 0, border: '1px solid #333' }} />}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#ddd' }}>{aug.name}</div>
              {aug.tier != null && (
                <span style={{
                  fontSize: '0.52rem', fontWeight: 600, padding: '1px 4px', borderRadius: 3,
                  color: aug.tier === 1 ? '#9ca3af' : aug.tier === 2 ? '#f59e0b' : '#a855f7',
                  background: aug.tier === 1 ? 'rgba(156,163,175,0.12)' : aug.tier === 2 ? 'rgba(245,158,11,0.12)' : 'rgba(168,85,247,0.12)'
                }}>
                  {aug.tier === 1 ? 'Bạc' : aug.tier === 2 ? 'Vàng' : 'Kim Cương'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CarouselList({ comp }: { comp: ApiComp }) {
  if (!comp.carousel_priority?.length) return null;
  return (
    <div>
      <div style={PANEL_LABEL}>Ưu Tiên Vòng Quay</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {comp.carousel_priority.map((item, i) => (
          <div key={`${item.id}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 5, background: '#1a1a1e', border: '1px solid #252530' }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#f0b90b', minWidth: 18 }}>#{i + 1}</span>
            {item.image && <img src={item.image} alt={item.name} style={{ width: 22, height: 22, objectFit: 'cover', borderRadius: 3, flexShrink: 0, border: '1px solid #333' }} />}
            <span style={{ fontSize: '0.65rem', color: '#ccc', fontWeight: 500 }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Expanded Detail — with tab system ────────────────────────────────────────
function CompDetail({ comp, sortedTraits }: { comp: ApiComp; sortedTraits: CompActiveTrait[] }) {
  const [vp, setVp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [activeTab, setActiveTab] = useState<'board' | 'items'>('board');
  const [champItems, setChampItems] = useState<ChampionItemRec[] | null>(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const [availW, setAvailW] = useState(0);

  useEffect(() => {
    const upd = () => setVp(window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1100 ? 'tablet' : 'desktop');
    upd();
    window.addEventListener('resize', upd);
    return () => window.removeEventListener('resize', upd);
  }, []);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([e]) => setAvailW(e.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, [vp, activeTab]);

  const fetchChampItems = useCallback(async () => {
    if (champItems !== null) return;
    setLoadingItems(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
      const res = await fetch(`${apiBase}/api/v1/comps/${comp.id}/champion-items?top=5`);
      if (res.ok) setChampItems(await res.json());
    } catch {/* ignore */ } finally {
      setLoadingItems(false);
    }
  }, [comp.id, champItems]);

  const handleTabChange = (tab: 'board' | 'items') => {
    setActiveTab(tab);
    if (tab === 'items') fetchChampItems();
  };

  const slots = comp.final_board ?? [];
  const BOARD_BG: React.CSSProperties = {
    background: 'radial-gradient(ellipse at 50% 30%, #1e1e3f 0%, #0d0d1a 60%, #060610 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  };

  // Tab bar
  const TabBar = (
    <div style={{
      display: 'flex', borderBottom: '1px solid #1e1e1e',
      background: '#0a0a0d',
    }}>
      {([['board', 'Sắp Xếp Đội Hình'], ['items', 'Trang Bị Khuyên Dùng']] as const).map(([tab, label]) => (
        <button
          key={tab}
          onClick={() => handleTabChange(tab)}
          style={{
            flex: 1, padding: '10px 16px',
            fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            border: 'none', cursor: 'pointer',
            background: activeTab === tab ? '#0e0e10' : 'transparent',
            color: activeTab === tab ? '#f0b90b' : '#555',
            borderBottom: activeTab === tab ? '2px solid #f0b90b' : '2px solid transparent',
            transition: 'all 0.2s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  // ── MOBILE ──────────────────────────────────────────────────────────────────
  if (vp === 'mobile') return (
    <div style={{ background: '#0e0e10', borderTop: '1px solid #1e1e1e' }}>
      {TabBar}
      {activeTab === 'board' ? (
        <>
          <div style={{ borderBottom: '1px solid #1a1a1a' }}>
            <StatStrip comp={comp} horizontal />
          </div>
          <div ref={boardRef} style={{ ...BOARD_BG, padding: '16px 8px', borderBottom: '1px solid #1a1a1a' }}>
            <HexBoard slots={slots} availW={availW - 16} />
          </div>
          {sortedTraits.length > 0 && (
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a1a', overflowX: 'auto' }}>
              <div style={PANEL_LABEL}>Tộc / Hệ</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {sortedTraits.map(t => <TraitCard key={t.id} trait={t} />)}
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '10px 10px', borderRight: '1px solid #1a1a1a' }}><AugmentList comp={comp} /></div>
            <div style={{ padding: '10px 10px' }}><CarouselList comp={comp} /></div>
          </div>
        </>
      ) : (
        <ChampionItemsTab items={champItems} loading={loadingItems} />
      )}
    </div>
  );

  // ── TABLET ──────────────────────────────────────────────────────────────────
  if (vp === 'tablet') return (
    <div style={{ background: '#0e0e10', borderTop: '1px solid #1e1e1e' }}>
      {TabBar}
      {activeTab === 'board' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr' }}>
            <div style={{ padding: '14px 12px', borderRight: '1px solid #1e1e1e', background: '#0f0f12', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <StatStrip comp={comp} />
              {sortedTraits.length > 0 && (
                <div style={{ flex: 1 }}>
                  <div style={PANEL_LABEL}>Tộc / Hệ</div>
                  <div className="detail-traits-list">
                    {sortedTraits.map(t => <TraitCard key={t.id} trait={t} />)}
                  </div>
                </div>
              )}
            </div>
            <div ref={boardRef} style={{ ...BOARD_BG, padding: '24px 16px' }}>
              <HexBoard slots={slots} availW={availW - 32} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #1e1e1e', background: '#0f0f12' }}>
            <div style={{ padding: '14px 16px', borderRight: '1px solid #1e1e1e' }}><AugmentList comp={comp} /></div>
            <div style={{ padding: '14px 16px' }}><CarouselList comp={comp} /></div>
          </div>
        </>
      ) : (
        <ChampionItemsTab items={champItems} loading={loadingItems} />
      )}
    </div>
  );

  // ── DESKTOP ──────────────────────────────────────────────────────────────────
  return (
    <div className="comp-detail" style={{ padding: 0, background: '#0e0e10' }}>
      {TabBar}
      {activeTab === 'board' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 185px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 12px', borderRight: '1px solid #1e1e1e', background: '#0f0f12' }}>
            <StatStrip comp={comp} />
            {sortedTraits.length > 0 && (
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.62rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px 0' }}>Tộc / Hệ</h3>
                <div className="detail-traits-list">{sortedTraits.map(t => <TraitCard key={t.id} trait={t} />)}</div>
              </div>
            )}
          </div>
          <div ref={boardRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 16px', background: 'radial-gradient(ellipse at 50% 30%, #1e1e3f 0%, #0d0d1a 60%, #060610 100%)' }}>
            <HexBoard slots={slots} availW={availW - 32} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 12px', borderLeft: '1px solid #1e1e1e', background: '#0f0f12', overflowY: 'auto' }}>
            <AugmentList comp={comp} />
            <CarouselList comp={comp} />
          </div>
        </div>
      ) : (
        <ChampionItemsTab items={champItems} loading={loadingItems} />
      )}
    </div>
  );
}

// ── Champion Items Tab ────────────────────────────────────────────────────────
// ── Mobile detection hook ────────────────────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

// ── Item Pill ────────────────────────────────────────────────────────────────
function ItemPill({ item, isBest, isMobile }: { item: RecommendedItem; isBest: boolean; isMobile: boolean }) {
  const [showTip, setShowTip] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);

  // Close tooltip on outside click
  useEffect(() => {
    if (!showTip) return;
    const handler = (e: MouseEvent) => {
      if (tipRef.current && !tipRef.current.contains(e.target as Node)) setShowTip(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showTip]);

  if (isMobile) {
    // Mobile: icon-only + click tooltip
    return (
      <div ref={tipRef} style={{ position: 'relative', flexShrink: 0 }}>
        <div
          onClick={() => setShowTip(!showTip)}
          style={{
            width: 30, height: 30, borderRadius: 5, overflow: 'hidden',
            border: isBest ? '1.5px solid rgba(240,185,11,0.5)' : '1.5px solid #2a2a30',
            background: '#0a0a14', cursor: 'pointer',
          }}
        >
          {item.image && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={item.image} alt={item.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          )}
        </div>
        {showTip && (
          <div style={{
            position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
            background: '#1a1a2e', border: '1px solid #333', borderRadius: 8,
            padding: '8px 10px', minWidth: 140, zIndex: 100,
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#e8e8e8', marginBottom: 4 }}>
              {item.name}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: '0.55rem', color: '#22c55e' }}>WR {item.win_rate}</span>
              <span style={{ fontSize: '0.55rem', color: '#888' }}>Pick {item.pick_percent}</span>
              <span style={{ fontSize: '0.55rem', color: '#888' }}>Pos {item.avg_placement}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop: full pill
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      padding: '4px 8px 4px 4px',
      borderRadius: 6,
      background: isBest ? 'rgba(240,185,11,0.08)' : '#151518',
      border: isBest ? '1px solid rgba(240,185,11,0.2)' : '1px solid #1e1e22',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 4, overflow: 'hidden',
        flexShrink: 0, border: '1px solid #2a2a30', background: '#0a0a14',
      }}>
        {item.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.image} alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>
      <div style={{ minWidth: 60, flex: 1 }}>
        <div style={{
          fontSize: '0.62rem', fontWeight: 600,
          color: isBest ? '#e8e8e8' : '#aaa',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.name}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 1 }}>
          <span style={{ fontSize: '0.5rem', color: '#22c55e', fontWeight: 600 }}>WR {item.win_rate}</span>
          <span style={{ fontSize: '0.5rem', color: '#888' }}>Pick {item.pick_percent}</span>
          <span style={{ fontSize: '0.5rem', color: '#888' }}>Pos {item.avg_placement}</span>
        </div>
      </div>
    </div>
  );
}

// ── Champion Items Tab — Responsive Table ──────────────────────────────────────
function ChampionItemsTab({ items, loading }: { items: ChampionItemRec[] | null; loading: boolean }) {
  const isMobile = useIsMobile();

  if (loading) return (
    <div style={{ padding: '40px 24px', textAlign: 'center', color: '#555', fontSize: '0.8rem' }}>
      <div style={{ display: 'inline-block', width: 20, height: 20, border: '2px solid #333', borderTopColor: '#f0b90b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ marginTop: 8 }}>Đang tải trang bị...</div>
    </div>
  );
  if (!items || items.length === 0) return (
    <div style={{ padding: '40px 24px', textAlign: 'center', color: '#444', fontSize: '0.8rem' }}>
      Không có dữ liệu trang bị
    </div>
  );

  return (
    <div style={{ background: '#0e0e10', width: '100%' }}>
      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '90px 1fr' : '200px 1fr',
        padding: isMobile ? '6px 10px' : '8px 14px',
        borderBottom: '1px solid #1e1e1e',
        background: '#0a0a0d',
      }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', borderRight: '1px solid #1e1e1e', paddingRight: 14 }}>
          Tướng
        </span>
        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>
          Trang Bị Đề Xuất
        </span>
      </div>

      {/* Champion rows */}
      {items.map((champ, champIdx) => (
        <div
          key={champ.champion_id}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '90px 1fr' : '200px 1fr',
            alignItems: 'center',
            padding: isMobile ? '7px 10px' : '8px 14px',
            borderBottom: '1px solid #1a1a1e',
            background: champIdx % 2 === 0 ? '#0f0f12' : '#0c0c0f',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#151518')}
          onMouseLeave={(e) => (e.currentTarget.style.background = champIdx % 2 === 0 ? '#0f0f12' : '#0c0c0f')}
        >
          {/* Champion info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, borderRight: '1px solid #1e1e1e', paddingRight: 14, paddingLeft: 60 }}>
            <div style={{
              width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 6, overflow: 'hidden',
              border: `2px solid ${COST_BORDER[1] ?? '#6b7280'}`,
              flexShrink: 0, background: '#1a1a2e',
            }}>
              {champ.icon_path && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={champ.icon_path} alt={champ.champion_name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              )}
            </div>
            <span style={{
              fontSize: isMobile ? '0.6rem' : '0.72rem', fontWeight: 600, color: '#ddd',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {champ.champion_name}
            </span>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            {champ.recommended_items.length === 0 ? (
              <span style={{ fontSize: '0.6rem', color: '#444' }}>—</span>
            ) : champ.recommended_items.map((item, idx) => (
              <ItemPill key={item.id} item={item} isBest={idx === 0} isMobile={isMobile} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


// ── Hex Cell ─────────────────────────────────────────────────────────────────

const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';

// Cost border glow colors (slightly lighter for the glow effect)
const COST_GLOW: Record<number, string> = {
  1: 'rgba(107,114,128,0.5)',
  2: 'rgba(34,197,94,0.5)',
  3: 'rgba(59,130,246,0.5)',
  4: 'rgba(168,85,247,0.6)',
  5: 'rgba(245,158,11,0.6)',
};

// ── Champion Tooltip ─────────────────────────────────────────────────────────

function ChampTooltip({ champ }: { champ: any }) {
  const borderColor = COST_BORDER[champ.cost] ?? '#6b7280';
  
  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: '50%', transform: 'translate(-50%, -10px)',
      background: '#1a1a2e', border: '1px solid #333', borderRadius: 8,
      padding: '10px 12px', minWidth: 260, zIndex: 100,
      boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
      pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {/* Header: Icon, Name, Cost */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 4, border: `2px solid ${borderColor}`, overflow: 'hidden' }}>
          {champ.icon_path ? (
            <img src={champ.icon_path} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: '#222' }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8e8e8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{champ.name}</div>
          <div style={{ fontSize: '0.6rem', color: borderColor, fontWeight: 600 }}>{champ.cost} Vàng</div>
        </div>
      </div>
      
      {/* Traits */}
      {champ.traits && champ.traits.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
          {champ.traits.map((t: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {t.image && <img src={t.image} alt="" style={{ width: 14, height: 14 }} />}
              <span style={{ fontSize: '0.6rem', color: '#ccc' }}>{t.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Skill */}
      {champ.skill && (
        <div style={{ marginTop: 4, paddingTop: 6, borderTop: '1px solid #333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {champ.skill.icon_path && (
              <img src={champ.skill.icon_path} alt="" style={{ width: 24, height: 24, borderRadius: 4, border: '1px solid #444' }} />
            )}
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f0b90b' }}>{champ.skill.name}</div>
              <div style={{ fontSize: '0.55rem', color: '#66abff' }}>
                Năng lượng: {champ.skill.mana_start} / {champ.skill.mana_max}
              </div>
            </div>
          </div>
          {champ.skill.description && (
            <div style={{ fontSize: '0.6rem', color: '#aaa', lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: champ.skill.description }} />
          )}
        </div>
      )}
    </div>
  );
}

function HexCell({ slot, hexW, hexH }: { slot: CompBoardSlot | null; hexW: number; hexH: number }) {
  const BORDER_PX = 4;
  const innerW = hexW - BORDER_PX * 2;
  const innerH = hexH - BORDER_PX * 2;

  // ── Empty cell ──
  if (!slot || !slot.champion) {
    return (
      <div style={{ width: hexW, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: hexW, height: hexH,
          clipPath: HEX_CLIP,
          background: 'linear-gradient(160deg, rgba(50,50,90,0.6), rgba(20,20,45,0.8))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: innerW, height: innerH,
            clipPath: HEX_CLIP,
            background: 'linear-gradient(160deg, rgba(10,10,25,0.95), rgba(5,5,18,0.98))',
          }} />
        </div>
        <div style={{ height: 18 }} />
      </div>
    );
  }

  // ── Occupied cell ──
  const champ = slot.champion;
  const borderColor = COST_BORDER[champ.cost] ?? '#6b7280';
  const bgColor = COST_BG[champ.cost] ?? '#374151';
  const glowColor = COST_GLOW[champ.cost] ?? 'rgba(107,114,128,0.4)';

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

  return (
    <div 
      ref={tipRef}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => setShowTip(!showTip)}
      style={{ width: hexW, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', cursor: 'pointer' }}
    >
      {showTip && <ChampTooltip champ={champ} />}

      {/* Hex wrapper — glow + border + art + items overlay */}
      <div style={{
        position: 'relative',
        filter: `drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 3px 6px rgba(0,0,0,0.9))`,
      }}>
        {/* Outer border hex */}
        <div style={{
          width: hexW, height: hexH,
          clipPath: HEX_CLIP,
          background: `linear-gradient(160deg, ${borderColor}ff, ${borderColor}bb)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          {/* Inner hex — champion art */}
          <div style={{
            width: innerW, height: innerH,
            clipPath: HEX_CLIP,
            background: bgColor,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {(champ.splash_path || champ.icon_path) ? (() => {
              const splashSrc = champ.splash_path
                ?? champ.icon_path!.replace('/icons/', '/splashes/');
              return (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={splashSrc}
                  alt={champ.name}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (champ.icon_path && img.src !== champ.icon_path) img.src = champ.icon_path;
                  }}
                  style={{
                    position: 'absolute',
                    width: '210%',
                    height: 'auto',
                    left: '-90%',
                    top: '0%',
                    display: 'block',
                  }}
                />
              );
            })() : (
              <span style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.9)' }}>
                {champ.name.substring(0, 2).toUpperCase()}
              </span>
            )}
            {/* Bottom vignette */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)',
              pointerEvents: 'none',
            }} />
          </div>

        </div>

        {/* Name + 3-star — fixed position above items zone, always visible */}
        <div style={{
          position: 'absolute',
          bottom: Math.round(hexH * 0.06) + 28,
          left: 0, right: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          zIndex: 6, pointerEvents: 'none',
        }}>
          {slot.is_three_star && (
            <span style={{
              fontSize: 16, color: '#fbbf24', lineHeight: 1,
              textShadow: '0 0 8px rgba(251,191,36,1), 0 0 16px rgba(251,191,36,0.6), 0 1px 3px rgba(0,0,0,1)',
            }}>★★★</span>
          )}
          <span style={{
            fontSize: '0.72rem', fontWeight: 700, color: '#fff',
            lineHeight: 1, letterSpacing: 0.2,
            textShadow: '0 1px 4px rgba(0,0,0,1), 0 0 8px rgba(0,0,0,1)',
            maxWidth: hexW - 8,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{champ.name}</span>
        </div>

        {/* Items overlay — bottom of hex, outside clip-path so not clipped */}
        {slot.items && slot.items.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: Math.round(hexH * 0.06),
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
            zIndex: 5,
          }}>
            {slot.items.map((item, idx) => (
              <div key={`${item.id}-${idx}`} title={item.name} style={{
                width: 24, height: 24,
                borderRadius: 4,
                border: '1.5px solid rgba(255,255,255,0.4)',
                overflow: 'hidden',
                background: '#0a0a14',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 4px rgba(255,255,255,0.1)',
              }}>
                {item.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={item.image} alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#2a2a3a' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Champion Slot (compact, row view) ────────────────────────────────────────

function ChampionSlot({ slot, size = 52, itemSize = 18 }: { slot: CompBoardSlot, size?: number, itemSize?: number }) {
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

  if (!slot.champion) return null;
  const champ = slot.champion;
  const borderColor = COST_BORDER[champ.cost] ?? "#6b7280";

  return (
    <div
      ref={tipRef}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      onClick={() => setShowTip(!showTip)}
      className={`comp-champ-slot ${slot.is_three_star ? "comp-champ-slot--3star" : ""}`}
      style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, position: 'relative', cursor: 'pointer' }}
    >
      {showTip && <ChampTooltip champ={champ} />}
      {/* Champion icon — square, items overlaid at bottom */}
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        {/* Image clip box */}
        <div style={{
          width: size, height: size,
          borderRadius: 4,
          border: `2px solid ${borderColor}`,
          backgroundColor: COST_BG[champ.cost] ?? "#374151",
          overflow: 'hidden',
        }}>
          {champ.icon_path ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={champ.icon_path} alt={champ.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
          ) : (
            <span style={{ fontSize: size > 45 ? 14 : 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
              {champ.name.substring(0, 2).toUpperCase()}
            </span>
          )}

          {/* 3-star badge */}
          {slot.is_three_star && (
            <span style={{
              position: 'absolute', top: 2, left: 0, right: 0,
              textAlign: 'center', fontSize: size > 45 ? 10 : 8, color: '#fbbf24', lineHeight: 1,
              textShadow: '0 0 6px rgba(251,191,36,1)',
            }}>★★★</span>
          )}
        </div>

        {/* Items overlay — absolute on top of icon at bottom */}
        {slot.items && slot.items.length > 0 && (
          <div style={{
            position: 'absolute', bottom: size > 45 ? -8 : -5, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', gap: 2,
            zIndex: 2,
          }}>
            {slot.items.map((item, i) => (
              item.image
                ? /* eslint-disable-next-line @next/next/no-img-element */
                <img key={i} src={item.image} alt={item.name} title={item.name}
                  style={{
                    width: itemSize, height: itemSize, objectFit: 'cover',
                    borderRadius: 3, border: '1px solid rgba(0,0,0,0.5)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.9)',
                    flexShrink: 0,
                  }} />
                : <div key={i} style={{ width: itemSize, height: itemSize, borderRadius: 3, background: '#1a1a1a', flexShrink: 0 }} />
            ))}
          </div>
        )}
      </div>

      {/* Champion name */}
      <div style={{
        fontSize: size > 45 ? '0.55rem' : '0.45rem', fontWeight: 600, color: '#888',
        textAlign: 'center', maxWidth: size + 4,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        marginTop: size > 45 ? 14 : 8,
      }}>
        {champ.name}
      </div>
    </div>
  );
}

// ── Trait Icon (mini) ────────────────────────────────────────────────────────

function getTraitStyle(trait: CompActiveTrait) {
  const isMax = trait.current_style >= trait.total_styles && trait.total_styles > 0;
  if (trait.current_style === 0) {
    return {
      bg: "linear-gradient(135deg, #4b5563, #374151)",
      color: "#9ca3af"
    };
  }
  if (isMax) {
    return {
      bg: "linear-gradient(135deg, #c084fc, #06b6d4)",
      color: "#fff"
    };
  }
  return {
    bg: "linear-gradient(135deg, #fbbf24, #d97706)",
    color: "#fff"
  };
}

function getTraitStyleColor(trait: CompActiveTrait) {
  const isMax = trait.current_style >= trait.total_styles && trait.total_styles > 0;
  if (trait.current_style === 0) return "#9ca3af";
  if (isMax) return "#06b6d4";
  return "#f59e0b";
}

function TraitIcon({ trait }: { trait: CompActiveTrait }) {
  const { bg, color } = getTraitStyle(trait);
  const styleColor = getTraitStyleColor(trait);
  const isActive = trait.current_style > 0;
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

  return (
    <div ref={tipRef} style={{ position: 'relative' }}>
      <div
        className={`comp-trait-icon ${isActive ? "comp-trait-icon--active" : ""}`}
        style={{ 
          cursor: 'pointer',
          background: bg,
          border: 'none',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          width: 24, height: 26,
        }}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onClick={() => setShowTip(!showTip)}
      >
        {trait.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={trait.image}
            alt={trait.name}
            style={{ width: 14, height: 14, objectFit: "contain", filter: isActive ? "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" : "grayscale(0.8) opacity(0.5)", zIndex: 1 }}
          />
        ) : (
          <span style={{ fontSize: 10, fontWeight: 700, color, zIndex: 1 }}>{trait.name[0]}</span>
        )}
      </div>

      {showTip && (
        <div style={{
          position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a2e', border: '1px solid #333', borderRadius: 8,
          padding: '10px 12px', minWidth: 240, zIndex: 100,
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {trait.image && <img src={trait.image} alt="" style={{ width: 18, height: 18 }} />}
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8e8e8' }}>{trait.name}</span>
            <span style={{ fontSize: '0.65rem', color: styleColor, marginLeft: 'auto', fontWeight: 600 }}>
              Bậc {trait.current_style} ({trait.count})
            </span>
          </div>
          
          {trait.description && (
            <div style={{ fontSize: '0.65rem', color: '#aaa', lineHeight: 1.4, marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: trait.description }} />
          )}

          {trait.milestones && trait.milestones.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {trait.milestones.map((ms: any, i: number) => {
                const reqUnit = typeof ms === 'number' ? ms : (ms.min_units || ms.unit || 0);
                const effect = ms.effect || "";
                const isActive = trait.count >= reqUnit;
                return (
                  <div key={i} style={{ display: 'flex', gap: 6, opacity: isActive ? 1 : 0.4 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isActive ? styleColor : '#888', whiteSpace: 'nowrap' }}>
                      ({reqUnit})
                    </span>
                    {effect && (
                      <span style={{ fontSize: '0.65rem', color: isActive ? '#eee' : '#aaa', lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: effect }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {trait.champions && trait.champions.length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #333' }}>
              <div style={{ fontSize: '0.55rem', color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tướng</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {trait.champions.map((c: any) => {
                  const borderColor = COST_BORDER[c.cost] || '#666';
                  return (
                    <div key={c.id} style={{ 
                      width: 24, height: 24, borderRadius: 3, border: `1px solid ${borderColor}`, overflow: 'hidden'
                    }}>
                      {c.icon_path ? (
                        <img src={c.icon_path} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

// ── Trait Card (expanded detail) ─────────────────────────────────────────────

function TraitCard({ trait }: { trait: CompActiveTrait }) {
  const { bg, color } = getTraitStyle(trait);
  const styleColor = getTraitStyleColor(trait);
  const isActive = trait.current_style > 0;
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

  return (
    <div ref={tipRef} style={{ position: 'relative' }}>
      <div 
        className={`comp-trait-card ${isActive ? "comp-trait-card--active" : ""}`}
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onClick={() => setShowTip(!showTip)}
        style={{ cursor: 'pointer' }}
      >
        <div
          className="comp-trait-card__icon"
          style={{ 
            background: bg,
            border: 'none',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            width: 26, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {trait.image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={trait.image}
              alt={trait.name}
              style={{ width: 14, height: 14, objectFit: "contain", filter: isActive ? "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" : "grayscale(0.8) opacity(0.5)", zIndex: 1 }}
            />
          ) : (
            <span style={{ fontSize: 12, fontWeight: 700, color, zIndex: 1 }}>{trait.name[0]}</span>
          )}
        </div>
        <div className="comp-trait-card__info">
          <span className="comp-trait-card__name" style={isActive ? { color: "#e8e8e8" } : undefined}>
            {trait.name}
          </span>
          <div className="comp-trait-card__meta">
            <span className="comp-trait-card__count" style={{ color: styleColor }}>
              {trait.count}
            </span>
          </div>
        </div>
      </div>

      {showTip && (
        <div style={{
          position: 'absolute', bottom: '110%', left: '0',
          background: '#1a1a2e', border: '1px solid #333', borderRadius: 8,
          padding: '10px 12px', minWidth: 240, zIndex: 100,
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            {trait.image && <img src={trait.image} alt="" style={{ width: 18, height: 18 }} />}
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8e8e8' }}>{trait.name}</span>
            <span style={{ fontSize: '0.65rem', color: styleColor, marginLeft: 'auto', fontWeight: 600 }}>
              Bậc {trait.current_style} ({trait.count})
            </span>
          </div>

          {trait.description && (
            <div style={{ fontSize: '0.65rem', color: '#aaa', lineHeight: 1.4, marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: trait.description }} />
          )}

          {trait.milestones && trait.milestones.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {trait.milestones.map((ms: any, i: number) => {
                const reqUnit = typeof ms === 'number' ? ms : (ms.min_units || ms.unit || 0);
                const effect = ms.effect || "";
                const isActive = trait.count >= reqUnit;
                return (
                  <div key={i} style={{ display: 'flex', gap: 6, opacity: isActive ? 1 : 0.4 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isActive ? styleColor : '#888', whiteSpace: 'nowrap' }}>
                      ({reqUnit})
                    </span>
                    {effect && (
                      <span style={{ fontSize: '0.65rem', color: isActive ? '#eee' : '#aaa', lineHeight: 1.3 }} dangerouslySetInnerHTML={{ __html: effect }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {trait.champions && trait.champions.length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #333' }}>
              <div style={{ fontSize: '0.55rem', color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tướng</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {trait.champions.map((c: any) => {
                  const borderColor = COST_BORDER[c.cost] || '#666';
                  return (
                    <div key={c.id} style={{ 
                      width: 24, height: 24, borderRadius: 3, border: `1px solid ${borderColor}`, overflow: 'hidden'
                    }}>
                      {c.icon_path ? (
                        <img src={c.icon_path} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
