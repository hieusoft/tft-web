import apiClient from "@/lib/api-client";
import { toSlug } from "@/lib/slug";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePct(val: string | null): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

const TIER_COLOR: Record<string, string> = {
  S: "#ff4e50",
  A: "#ffa600",
  B: "#10b981",
  C: "#9e9e9e",
};

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const traits = await apiClient.getTraits();
  const trait = traits.find((t) => toSlug(t.name) === slug);
  if (!trait) return { title: "Trait không tồn tại" };
  return {
    title: `${trait.name} — Chi Tiết Tộc/Hệ TFT`,
    description:
      trait.description ?? `Thống kê chi tiết ${trait.name} trong TFT.`,
  };
}

// ── Static params (optional ISR prerender) ────────────────────────────────────

export async function generateStaticParams() {
  const traits = await apiClient.getTraits();
  return traits.map((t) => ({ slug: toSlug(t.name) }));
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function TraitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const traits = await apiClient.getTraits();
  const trait = traits.find((t) => toSlug(t.name) === slug);
  if (!trait) notFound();

  const hex = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";
  const tierColor = TIER_COLOR[trait.tier ?? ""] ?? "#6b7280";
  const top4Num = parsePct(trait.top4);
  const pickNum = parsePct(trait.pick_percent);
  const milestones = (trait.milestones ?? []) as Record<string, unknown>[];

  const placementColor =
    trait.placement != null
      ? trait.placement < 4.0
        ? "#4ade80"
        : trait.placement < 4.5
        ? "#facc15"
        : "#f87171"
      : "#e5e7eb";

  const stats = [
    { label: "Avg Placement", value: trait.placement != null ? trait.placement.toFixed(2) : "—", color: placementColor },
    { label: "Top 4 Rate",    value: trait.top4       ?? "—", color: "#e5e7eb" },
    { label: "Pick Rate",     value: trait.pick_percent ?? "—", color: "#e5e7eb" },
    { label: "Games Played",  value: trait.pick_count  ?? "—", color: "#e5e7eb" },
  ];

  return (
    <div style={{ background: "#111111", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 16px" }}>

        {/* ── Back link ── */}
        <Link
          href="/traits"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "#6b7280", textDecoration: "none",
            marginBottom: 20,
          }}
          className="hover:text-white transition-colors"
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </Link>

        {/* ── Header card ── */}
        <div style={{
          background: "#181818", border: "1px solid #222", borderRadius: 16,
          padding: "28px 32px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap",
        }}>
          {/* Hex icon */}
          <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
            <div style={{ position: "absolute", inset: 0, background: "#2a2a2a", clipPath: hex }} />
            {trait.image ? (
              <Image
                src={trait.image} alt={trait.name} fill sizes="80px"
                className="object-contain p-2"
                style={{ clipPath: hex }}
              />
            ) : (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                clipPath: hex, fontSize: 20, fontWeight: 800, color: "#9ca3af",
              }}>
                {trait.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name + tier + description */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", margin: 0 }}>
                {trait.name}
              </h1>
              {trait.tier && (
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, borderRadius: 8,
                  background: tierColor, fontSize: 13, fontWeight: 800, color: "#fff",
                }}>
                  {trait.tier}
                </span>
              )}
            </div>
            {trait.description && (
              <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.6, margin: 0 }}>
                {trait.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Stats row ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12, marginBottom: 20,
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "#181818", border: "1px solid #222", borderRadius: 12,
              padding: "18px 20px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Progress bars ── */}
        <div style={{
          background: "#181818", border: "1px solid #222", borderRadius: 12,
          padding: "20px 24px", marginBottom: 20,
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          <BarRow label="Top 4 Rate" value={top4Num} max={70} color="#4ade80" />
          <BarRow label="Pick Rate"  value={pickNum} max={50} color="#60a5fa" />
        </div>

        {/* ── Milestones ── */}
        {milestones.length > 0 && (
          <div style={{
            background: "#181818", border: "1px solid #222", borderRadius: 12,
            padding: "20px 24px",
          }}>
            <h2 style={{
              fontSize: 12, fontWeight: 700, color: "#6b7280",
              textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px",
            }}>
              Breakpoints
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {milestones.map((m, i) => {
                const count = m.count ?? m.num ?? m.units ?? m.n ?? m.level;
                const desc  = m.desc ?? m.description ?? m.effect ?? m.bonus ?? m.text;
                const raw   = count === undefined && desc === undefined
                  ? Object.entries(m).map(([k, v]) => `${k}: ${v}`).join(" · ")
                  : null;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 12,
                    padding: "12px 14px", background: "#1e1e1e",
                    borderRadius: 8, border: "1px solid #2a2a2a",
                  }}>
                    {count !== undefined && (
                      <span style={{
                        flexShrink: 0, minWidth: 28, height: 28, borderRadius: 6,
                        background: "#c8972a",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 800, color: "#fff",
                      }}>
                        {String(count)}
                      </span>
                    )}
                    <span style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.6 }}>
                      {desc !== undefined ? String(desc) : raw}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Bar row helper ────────────────────────────────────────────────────────────

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#9ca3af" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>
          {value > 0 ? `${value.toFixed(1)}%` : "—"}
        </span>
      </div>
      <div style={{ height: 6, background: "#2a2a2a", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color,
          borderRadius: 99, transition: "width 0.4s ease",
        }} />
      </div>
    </div>
  );
}
