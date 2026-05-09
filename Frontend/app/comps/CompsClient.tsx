"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import type { ApiComp, CompBoardSlot, CompActiveTrait } from "@/lib/types/comp";

// ── Constants ────────────────────────────────────────────────────────────────

const TIERS = ["Tất Cả", "S", "A", "B", "C"];

const TIER_CONFIG: Record<string, { bg: string; glow: string; text: string }> = {
  S: { bg: "linear-gradient(135deg, #ff4655 0%, #ff6b6b 100%)", glow: "0 0 12px rgba(255,70,85,0.4)", text: "#fff" },
  A: { bg: "linear-gradient(135deg, #f0b90b 0%, #ffd700 100%)", glow: "0 0 12px rgba(240,185,11,0.4)", text: "#000" },
  B: { bg: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)", glow: "0 0 12px rgba(59,130,246,0.3)", text: "#fff" },
  C: { bg: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)", glow: "0 0 12px rgba(139,92,246,0.3)", text: "#fff" },
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
      <div className="comp-list">
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
    <div className={`comp-row ${isExpanded ? "comp-row--expanded" : ""}`} data-comp-row>
      {/* Main row */}
      <div className="comp-row__main" onClick={onToggle}>
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
            <span className="comp-name">{comp.name}</span>
            {playstyle && (
              <span className="comp-playstyle-tag" style={{ color: playstyle.color, background: playstyle.bg }}>
                {playstyle.label}
              </span>
            )}
          </div>
        </div>

        <div className="comp-col comp-col--champs">
          <div className="comp-champs">
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
            {comp.avg_placement != null ? comp.avg_placement.toFixed(2) : "—"}
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
  const zoom = availW > 40 ? Math.min(1, availW / B_NAT_W) : 1;
  const grid = buildGrid(slots);
  return (
    <div style={{ position: 'relative', width: B_NAT_W, height: B_NAT_H, zoom, flexShrink: 0 }}>
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
  );
}

// ── Shared sub-pieces ────────────────────────────────────────────────────────
const PANEL_LABEL: React.CSSProperties = { fontSize: '0.58rem', fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 };

function StatStrip({ comp, horizontal }: { comp: ApiComp; horizontal?: boolean }) {
  const stats = [
    { label: 'Vị Trí TB', value: comp.avg_placement != null ? comp.avg_placement.toFixed(2) : '—', color: '#e8e8e8' },
    { label: 'Top 4', value: comp.avg_placement != null ? `${Math.max(0, Math.round((4.5 - comp.avg_placement) * 22))}%` : '—', color: '#22c55e' },
    { label: 'Win%', value: comp.avg_placement != null ? `${Math.max(0, Math.round((4.5 - comp.avg_placement) * 10))}%` : '—', color: '#f0b90b' },
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
              <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#ddd', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aug.name}</div>
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
            <span style={{ fontSize: '0.65rem', color: '#ccc', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Expanded Detail — 3 layout modes ─────────────────────────────────────────
function CompDetail({ comp, sortedTraits }: { comp: ApiComp; sortedTraits: CompActiveTrait[] }) {
  const [vp, setVp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
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
  }, [vp]);

  const slots = comp.final_board ?? [];
  const BOARD_BG: React.CSSProperties = {
    background: 'radial-gradient(ellipse at 50% 30%, #1e1e3f 0%, #0d0d1a 60%, #060610 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  };

  // ── MOBILE ──────────────────────────────────────────────────────────────────
  if (vp === 'mobile') return (
    <div style={{ background: '#0e0e10', borderTop: '1px solid #1e1e1e' }}>
      {/* Stats: 3 horizontal cells */}
      <div style={{ borderBottom: '1px solid #1a1a1a' }}>
        <StatStrip comp={comp} horizontal />
      </div>

      {/* Board — full width, auto-zoom */}
      <div ref={boardRef} style={{ ...BOARD_BG, padding: '16px 8px', borderBottom: '1px solid #1a1a1a' }}>
        <HexBoard slots={slots} availW={availW - 16} />
      </div>

      {/* Traits — horizontal scroll */}
      {sortedTraits.length > 0 && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a1a', overflowX: 'auto' }}>
          <div style={PANEL_LABEL}>Tộc / Hệ</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {sortedTraits.map(t => <TraitCard key={t.id} trait={t} />)}
          </div>
        </div>
      )}

      {/* Augments + Carousel — 2 col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: '10px 10px', borderRight: '1px solid #1a1a1a' }}><AugmentList comp={comp} /></div>
        <div style={{ padding: '10px 10px' }}><CarouselList comp={comp} /></div>
      </div>
    </div>
  );

  // ── TABLET (768–1099px) ──────────────────────────────────────────────────────
  if (vp === 'tablet') return (
    <div style={{ background: '#0e0e10', borderTop: '1px solid #1e1e1e' }}>
      {/* Top: left stats+traits | right board */}
      <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr' }}>
        {/* Left */}
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
        {/* Board */}
        <div ref={boardRef} style={{ ...BOARD_BG, padding: '24px 16px' }}>
          <HexBoard slots={slots} availW={availW - 32} />
        </div>
      </div>

      {/* Bottom: augments + carousel full width */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid #1e1e1e', background: '#0f0f12' }}>
        <div style={{ padding: '14px 16px', borderRight: '1px solid #1e1e1e' }}><AugmentList comp={comp} /></div>
        <div style={{ padding: '14px 16px' }}><CarouselList comp={comp} /></div>
      </div>
    </div>
  );

  // ── DESKTOP (≥1100px) — unchanged 3-column ────────────────────────────────
  return (
    <div className="comp-detail" style={{ padding: 0, background: '#0e0e10' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr 185px' }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 12px', borderRight: '1px solid #1e1e1e', background: '#0f0f12' }}>
          <StatStrip comp={comp} />
          {sortedTraits.length > 0 && (
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.62rem', fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px 0' }}>Tộc / Hệ</h3>
              <div className="detail-traits-list">{sortedTraits.map(t => <TraitCard key={t.id} trait={t} />)}</div>
            </div>
          )}
        </div>
        {/* CENTER board */}
        <div ref={boardRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 16px', background: 'radial-gradient(ellipse at 50% 30%, #1e1e3f 0%, #0d0d1a 60%, #060610 100%)' }}>
          <HexBoard slots={slots} availW={availW - 32} />
        </div>
        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 12px', borderLeft: '1px solid #1e1e1e', background: '#0f0f12', overflowY: 'auto' }}>
          <AugmentList comp={comp} />
          <CarouselList comp={comp} />
        </div>
      </div>
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

  return (
    <div style={{ width: hexW, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>

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

function ChampionSlot({ slot }: { slot: CompBoardSlot }) {
  if (!slot.champion) return null;
  const champ = slot.champion;
  const borderColor = COST_BORDER[champ.cost] ?? "#6b7280";

  return (
    <div
      className={`comp-champ-slot ${slot.is_three_star ? "comp-champ-slot--3star" : ""}`}
      title={`${champ.name}${slot.is_three_star ? " (3 star)" : ""}`}
      style={{ flexShrink: 0 }}
    >
      <div
        className="comp-champ-icon"
        style={{
          borderColor,
          backgroundColor: COST_BG[champ.cost] ?? "#374151",
          width: 32,
          height: 32,
          flexShrink: 0,
        }}
      >
        {champ.icon_path ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={champ.icon_path}
            alt={champ.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <span className="comp-champ-icon__fallback">
            {champ.name.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      {slot.items && slot.items.length > 0 && (
        <div className="comp-champ-items-dots">
          {slot.items.map((item, i) => (
            <div key={i} className="comp-champ-item-dot" title={item.name} />
          ))}
        </div>
      )}
      {slot.is_three_star && <div className="comp-champ-3star-glow" />}
    </div>
  );
}

// ── Trait Icon (mini) ────────────────────────────────────────────────────────

function TraitIcon({ trait }: { trait: CompActiveTrait }) {
  const styleColor = TRAIT_STYLE_COLORS[trait.current_style] ?? TRAIT_STYLE_COLORS[0];
  const isActive = trait.current_style > 0;

  return (
    <div
      className={`comp-trait-icon ${isActive ? "comp-trait-icon--active" : ""}`}
      style={{ borderColor: styleColor }}
      title={`${trait.name} (${trait.count})`}
    >
      {trait.image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={trait.image}
          alt={trait.name}
          className="comp-trait-icon__img"
          style={{ width: 22, height: 22, objectFit: "contain", ...(isActive ? {} : { filter: "grayscale(0.6) opacity(0.5)" }) }}
        />
      ) : (
        <span className="comp-trait-icon__text">{trait.name[0]}</span>
      )}
    </div>
  );
}

// ── Trait Card (expanded detail) ─────────────────────────────────────────────

function TraitCard({ trait }: { trait: CompActiveTrait }) {
  const styleColor = TRAIT_STYLE_COLORS[trait.current_style] ?? TRAIT_STYLE_COLORS[0];
  const isActive = trait.current_style > 0;

  return (
    <div className={`comp-trait-card ${isActive ? "comp-trait-card--active" : ""}`}>
      <div
        className="comp-trait-card__icon"
        style={{ borderColor: styleColor, background: isActive ? `${styleColor}15` : "transparent" }}
      >
        {trait.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={trait.image}
            alt={trait.name}
            className="comp-trait-card__img"
            style={{ width: 24, height: 24, objectFit: "contain", ...(isActive ? {} : { filter: "grayscale(0.6) opacity(0.5)" }) }}
          />
        ) : (
          <span>{trait.name[0]}</span>
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
          <div className="comp-trait-card__dots">
            {Array.from({ length: trait.total_styles }).map((_, i) => (
              <div
                key={i}
                className="comp-trait-card__dot"
                style={{ background: i < trait.current_style ? styleColor : "#3a3a3a" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
