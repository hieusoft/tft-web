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
      <style>{`
        .comp-row { position: relative; z-index: 1; transition: z-index 0s; overflow: visible !important; }
        .comp-row:hover { z-index: 50 !important; }
        .comp-row__main { position: relative; z-index: 2; overflow: visible !important; }
        .comp-col--champs { overflow: visible !important; }
        .comp-champs { overflow: visible !important; }
        .comp-champ-slot { overflow: visible !important; }
        .comp-champ-slot:hover { z-index: 999 !important; }
      `}</style>
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
        <div className="comp-col comp-col--stat">Thông Số</div>
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
    const styleA = getActualTraitStyle(a);
    const styleB = getActualTraitStyle(b);
    if (styleA !== styleB) return styleB - styleA;
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
              <TraitIcon key={t.id} trait={t} comp={comp} />
            ))}
            {sortedTraits.length > 5 && (
              <span className="comp-traits-more">+{sortedTraits.length - 5}</span>
            )}
          </div>
        </div>

        <div className="comp-col comp-col--stat">
          <div className="comp-stats">
            <CompStat label="TB" value={formatPlacement(comp.avg_placement)} highlight />
            <CompStat label="Pick" value={formatPercent(comp.pick_rate)} />
            <CompStat label="Win" value={formatPercent(comp.win_rate)} />
            <CompStat label="Top 4" value={formatPercent(comp.top4_rate)} />
          </div>
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

function formatPlacement(value: number | string | null | undefined) {
  return value != null ? Number(value).toFixed(2) : "—";
}

function formatPercent(value: number | string | null | undefined) {
  return value != null ? `${Number(value).toFixed(1)}%` : "—";
}

function CompStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="comp-stat">
      <span className="comp-stat__label">{label}</span>
      <span className={highlight ? "comp-stat__value comp-stat__value--highlight" : "comp-stat__value"}>
        {value}
      </span>
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
  
  const placedIndices = new Set<number>();

  // 1. Ưu tiên xếp các tướng có tọa độ hợp lệ và không bị trùng
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (slot.champion && slot.row != null && slot.hex != null) {
      const r = slot.row;
      const c = slot.hex - slot.row * B_COLS;
      if (r >= 0 && r < B_ROWS && c >= 0 && c < B_COLS) {
        if (!grid[r][c]) {
          grid[r][c] = slot;
          placedIndices.add(i);
        }
      }
    }
  }

  // 2. Xếp các tướng còn lại (thiếu tọa độ hoặc bị trùng vị trí) vào các ô trống
  let currR = 0;
  let currC = 0;
  for (let i = 0; i < slots.length; i++) {
    if (placedIndices.has(i)) continue;
    const slot = slots[i];
    if (!slot.champion) continue;

    while (currR < B_ROWS) {
      if (!grid[currR][currC]) {
        grid[currR][currC] = slot;
        currC++;
        if (currC >= B_COLS) {
          currC = 0;
          currR++;
        }
        break;
      }
      currC++;
      if (currC >= B_COLS) {
        currC = 0;
        currR++;
      }
    }
  }
  
  return grid;
}

// HexBoard — renders the 4×7 hex grid, auto-zooms to availW
function HexBoard({ slots, availW }: { slots: CompBoardSlot[]; availW: number }) {
  const scale = availW > 40 ? Math.min(1, availW / B_NAT_W) : 1;
  const grid = buildGrid(slots);
  return (
    <div style={{ width: B_NAT_W * scale, height: B_NAT_H * scale, flexShrink: 0, overflow: 'visible' }}>
      <style>{`.hex-wrapper:hover { z-index: 999 !important; }`}</style>
      <div style={{ position: 'relative', width: B_NAT_W, height: B_NAT_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {Array.from({ length: B_ROWS }, (_, ri) =>
          Array.from({ length: B_COLS }, (_, ci) => {
            const x = ci * (B_HW + B_GAP) + (ri % 2 === 1 ? Math.round(B_HW / 2 + B_GAP / 2) : 0);
            const y = ri * B_STEP;
            return (
              <div key={`${ri}-${ci}`} className="hex-wrapper" style={{ position: 'absolute', left: x, top: y, zIndex: B_ROWS - ri }}>
                <HexCell slot={grid[ri][ci]} hexW={B_HW} hexH={B_HH} ri={ri} />
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
            {aug.image && <img loading="lazy" src={aug.image} alt={aug.name} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 5, flexShrink: 0, border: '1px solid #333' }} />}
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
            {item.image && <img loading="lazy" src={item.image} alt={item.name} style={{ width: 22, height: 22, objectFit: 'cover', borderRadius: 3, flexShrink: 0, border: '1px solid #333' }} />}
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
      const res = await fetch(`${apiBase}/api/v1/comps/${comp.slug}/champion-items?top=5`);
      if (res.ok) setChampItems(await res.json());
    } catch {/* ignore */ } finally {
      setLoadingItems(false);
    }
  }, [comp.slug, champItems]);

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
                {sortedTraits.map(t => <TraitCard key={t.id} trait={t} comp={comp} />)}
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
                    {sortedTraits.map(t => <TraitCard key={t.id} trait={t} comp={comp} />)}
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
                <div className="detail-traits-list">{sortedTraits.map(t => <TraitCard key={t.id} trait={t} comp={comp} />)}</div>
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
            <img loading="lazy" src={item.image} alt={item.name}
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
      width: '100%', boxSizing: 'border-box'
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 4, overflow: 'hidden',
        flexShrink: 0, border: '1px solid #2a2a30', background: '#0a0a14',
      }}>
        {item.image && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img loading="lazy" src={item.image} alt={item.name}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, borderRight: '1px solid #1e1e1e', paddingRight: 14, paddingLeft: isMobile ? 10 : 20 }}>
            <div style={{
              width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 6, overflow: 'hidden',
              border: `2px solid ${COST_BORDER[1] ?? '#6b7280'}`,
              flexShrink: 0, background: '#1a1a2e',
            }}>
              {champ.icon_path && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img loading="lazy" src={champ.icon_path} alt={champ.champion_name}
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
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: isMobile ? 5 : 8, 
            alignItems: 'center', 
            justifyItems: isMobile ? 'center' : 'stretch'
          }}>
            {champ.recommended_items.length === 0 ? (
              <span style={{ fontSize: '0.6rem', color: '#444', gridColumn: '1 / -1', textAlign: 'center' }}>—</span>
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

function ChampTooltip({ champ, position = 'top' }: { champ: any, position?: 'top' | 'bottom' }) {
  const borderColor = COST_BORDER[champ.cost] ?? '#6b7280';
  
  return (
    <div style={{
      position: 'absolute', 
      ...(position === 'top' 
        ? { bottom: '100%', left: '50%', transform: 'translate(-50%, -10px)' }
        : { top: '100%', left: '50%', transform: 'translate(-50%, 10px)' }),
      background: '#1a1a2e', border: '1px solid #333', borderRadius: 8,
      padding: '10px 12px', minWidth: 260, maxWidth: 320, zIndex: 100,
      boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
      pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {/* Header: Icon, Name, Cost */}
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
      
      {/* Traits */}
      {champ.traits && champ.traits.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
          {champ.traits.map((t: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {t.image && <img loading="lazy" src={t.image} alt="" style={{ width: 14, height: 14 }} />}
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
}

function HexCell({ slot, hexW, hexH, ri = 0 }: { slot: CompBoardSlot | null; hexW: number; hexH: number; ri?: number }) {
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
      {showTip && <ChampTooltip champ={champ} position={ri < 2 ? 'bottom' : 'top'} />}

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
                <img loading="lazy" src={splashSrc}
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
                  <img loading="lazy" src={item.image} alt={item.name}
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
      {showTip && <ChampTooltip champ={champ} position="bottom" />}
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
            <img loading="lazy" src={champ.icon_path} alt={champ.name}
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
                <img loading="lazy" key={i} src={item.image} alt={item.name} title={item.name}
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

function getActualTraitStyle(trait: CompActiveTrait): number {
  if (!trait.milestones || trait.milestones.length === 0) return trait.current_style;
  
  const reqs = trait.milestones.map(ms => typeof ms === 'number' ? ms : (ms.min_units || ms.unit || ms.min || 0)).filter(u => u > 0);
  if (reqs.length === 0) return trait.current_style;
  
  reqs.sort((a, b) => a - b);
  
  let activeIndex = -1;
  for (let i = reqs.length - 1; i >= 0; i--) {
    if (trait.count >= reqs[i]) {
      activeIndex = i;
      break;
    }
  }
  
  if (activeIndex === -1) return 0;

  // Calculate dynamically based on TFT rules
  const totalChamps = trait.champions ? trait.champions.length : 0;
  const maxReq = reqs[reqs.length - 1];
  const requiresEmblem = totalChamps > 0 && maxReq > totalChamps;
  const N = reqs.length;
  
  // Max milestone
  if (activeIndex === N - 1) {
    return requiresEmblem ? 4 : 3; // Kim Cương (Prismatic) or Vàng (Gold)
  }
  
  // Lowest milestone
  if (activeIndex === 0) {
    return 1; // Đồng (Bronze)
  }
  
  // Middle milestones
  if (N === 4) {
    if (activeIndex === 1) return 2; // Bạc (Silver)
    if (activeIndex === 2) return 3; // Vàng (Gold)
  }
  
  if (N === 5) {
    if (activeIndex === 1) return 1; // Đồng
    if (activeIndex === 2) return 2; // Bạc
    if (activeIndex === 3) return 3; // Vàng
  }
  
  return 2; // Default cho giữa là Bạc (Silver)
}

function getTraitStyle(trait: CompActiveTrait) {
  const style = getActualTraitStyle(trait);
  
  if (style === 0) {
    return { bg: "linear-gradient(135deg, #2b2b36, #1e1e26)", color: "#6b7280" }; // Inactive (Dark Gray)
  }
  
  if (style >= 4) {
    return { bg: "linear-gradient(135deg, #a855f7, #06b6d4)", color: "#fff" }; // Prismatic
  }
  
  if (style === 3) {
    return { bg: "linear-gradient(135deg, #fbbf24, #d97706)", color: "#fff" }; // Gold
  }
  
  if (style === 2) {
    return { bg: "linear-gradient(135deg, #9ca3af, #6b7280)", color: "#fff" }; // Silver
  }
  
  // style === 1
  return { bg: "linear-gradient(135deg, #b45309, #78350f)", color: "#fff" }; // Bronze
}

function getTraitStyleColor(trait: CompActiveTrait) {
  const style = getActualTraitStyle(trait);
  
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
  
  // If milestones already have effects, just return as is
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
  } catch (e) {
  }
  
  return { desc, effects };
}

function TraitIcon({ trait, comp }: { trait: CompActiveTrait; comp: ApiComp }) {
  const { bg, color } = getTraitStyle(trait);
  const styleColor = getTraitStyleColor(trait);
  const isActive = trait.current_style > 0;
  const [showTip, setShowTip] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);

  const compChampIds = useMemo(() => {
    return new Set(
      comp.final_board
        ?.filter(slot => slot.champion != null)
        .map(slot => slot.champion!.id) || []
    );
  }, [comp.final_board]);

  const parsedTrait = useMemo(() => {
    return parseTraitDescription(trait.description, trait.milestones || []);
  }, [trait.description, trait.milestones]);

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
          <img loading="lazy" src={trait.image}
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
            {trait.image && <img loading="lazy" src={trait.image} alt="" style={{ width: 18, height: 18 }} />}
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8e8e8' }}>{trait.name}</span>
            <span style={{ fontSize: '0.65rem', color: styleColor, marginLeft: 'auto', fontWeight: 600 }}>
              Bậc {trait.current_style} ({trait.count})
            </span>
          </div>
          
          {parsedTrait.desc && (
            <div style={{ fontSize: '0.65rem', color: '#aaa', lineHeight: 1.4, marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: parsedTrait.desc }} />
          )}

          {trait.milestones && trait.milestones.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {trait.milestones.map((ms: any, i: number) => {
                const reqUnit = typeof ms === 'number' ? ms : (ms.min_units || ms.unit || ms.min || 0);
                const effect = parsedTrait.effects[reqUnit] || "";
                const isMilestoneActive = trait.count >= reqUnit;
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

          {trait.champions && trait.champions.length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #333' }}>
              <div style={{ fontSize: '0.55rem', color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tướng</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {trait.champions.map((c: any) => {
                  const borderColor = COST_BORDER[c.cost] || '#666';
                  const inComp = compChampIds.has(c.id);
                  return (
                    <div key={c.id} style={{ 
                      width: 24, height: 24, borderRadius: 3, border: `1px solid ${borderColor}`, overflow: 'hidden',
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

// ── Trait Card (expanded detail) ─────────────────────────────────────────────

function TraitCard({ trait, comp }: { trait: CompActiveTrait; comp: ApiComp }) {
  const { bg, color } = getTraitStyle(trait);
  const styleColor = getTraitStyleColor(trait);
  const isActive = trait.current_style > 0;
  const [showTip, setShowTip] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);

  const compChampIds = useMemo(() => {
    return new Set(
      comp.final_board
        ?.filter(slot => slot.champion != null)
        .map(slot => slot.champion!.id) || []
    );
  }, [comp.final_board]);

  const parsedTrait = useMemo(() => {
    return parseTraitDescription(trait.description, trait.milestones || []);
  }, [trait.description, trait.milestones]);

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
            <img loading="lazy" src={trait.image}
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
            {trait.image && <img loading="lazy" src={trait.image} alt="" style={{ width: 18, height: 18 }} />}
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e8e8e8' }}>{trait.name}</span>
            <span style={{ fontSize: '0.65rem', color: styleColor, marginLeft: 'auto', fontWeight: 600 }}>
              Bậc {trait.current_style} ({trait.count})
            </span>
          </div>

          {parsedTrait.desc && (
            <div style={{ fontSize: '0.65rem', color: '#aaa', lineHeight: 1.4, marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: parsedTrait.desc }} />
          )}

          {trait.milestones && trait.milestones.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              {trait.milestones.map((ms: any, i: number) => {
                const reqUnit = typeof ms === 'number' ? ms : (ms.min_units || ms.unit || ms.min || 0);
                const effect = parsedTrait.effects[reqUnit] || "";
                const isMilestoneActive = trait.count >= reqUnit;
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

          {trait.champions && trait.champions.length > 0 && (
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #333' }}>
              <div style={{ fontSize: '0.55rem', color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tướng</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {trait.champions.map((c: any) => {
                  const borderColor = COST_BORDER[c.cost] || '#666';
                  const inComp = compChampIds.has(c.id);
                  return (
                    <div key={c.id} style={{ 
                      width: 24, height: 24, borderRadius: 3, border: `1px solid ${borderColor}`, overflow: 'hidden',
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
