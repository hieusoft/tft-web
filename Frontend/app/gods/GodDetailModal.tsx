"use client";

import { useEffect, useState } from "react";
import { fetchGodDetailAction } from "./actions";
import type { ApiGodDetail } from "@/lib/api-client";

import { TIER_HEX } from "@/lib/constants";
import { TFT, TFT_FONT, tftBevel } from "@/lib/tft-theme";
import TierBadge from "@/components/tft/TierBadge";
import { CornerOrnaments } from "@/components/tft/TFTPanel";
import SectionTitle from "@/components/tft/SectionTitle";

export default function GodDetailModal({
  godSlug,
  onClose,
}: {
  godSlug: string;
  onClose: () => void;
}) {
  const [god, setGod] = useState<ApiGodDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchGodDetailAction(godSlug);
      if (!cancelled) {
        setGod(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [godSlug]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(4px)",
        fontFamily: TFT_FONT.body,
      }}
    >
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(180deg, ${TFT.panelAlt} 0%, ${TFT.panel} 100%)`,
          border: `1px solid ${TFT.goldDim}`,
          color: TFT.text,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.85)",
        }}
      >
        <CornerOrnaments />

        {loading ? (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: TFT.gold,
              fontSize: 13,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Đang tải...
          </div>
        ) : god ? (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                background: `linear-gradient(180deg, #1a2129 0%, ${TFT.panel} 100%)`,
                borderBottom: `1px solid ${TFT.goldDim}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    position: "relative",
                    background: "#000",
                    flexShrink: 0,
                    boxShadow: tftBevel(TIER_HEX[god.rank] ?? TFT.gold, true),
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    loading="lazy"
                    src={god.image}
                    alt={god.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      imageRendering: "pixelated",
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <h2
                      className="tft-heading"
                      style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: TFT.goldBright,
                        margin: 0,
                        letterSpacing: "0.02em",
                        textShadow: "0 2px 4px rgba(0,0,0,0.6)",
                      }}
                    >
                      {god.name}
                    </h2>
                    {god.rank && <TierBadge tier={god.rank} size={22} />}
                  </div>
                  <p
                    style={{
                      fontSize: 11,
                      color: TFT.textDim,
                      margin: 0,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}
                  >
                    {god.trait}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Đóng"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  background: "transparent",
                  border: `1px solid ${TFT.line}`,
                  color: TFT.textDim,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = TFT.gold;
                  e.currentTarget.style.borderColor = TFT.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = TFT.textDim;
                  e.currentTarget.style.borderColor = TFT.line;
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", padding: "20px 24px 24px" }}>
              {/* Augment / Boon */}
              {god.augment && (
                <div style={{ marginBottom: 22 }}>
                  <SectionTitle>Lõi Ân Huệ</SectionTitle>
                  <div
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      padding: "16px 18px",
                      background: TFT.panelSoft,
                      border: `1px solid ${TFT.lineSoft}`,
                      borderTop: "none",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        position: "relative",
                        background: "#000",
                        flexShrink: 0,
                        boxShadow: tftBevel(TFT.gold, true),
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        loading="lazy"
                        src={god.augment.image}
                        alt={god.augment.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          imageRendering: "pixelated",
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="tft-heading"
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: TFT.goldBright,
                          marginBottom: 6,
                          letterSpacing: "0.02em",
                        }}
                      >
                        {god.augment.name}
                      </div>
                      <p
                        style={{
                          fontSize: 12,
                          color: TFT.textDim,
                          lineHeight: 1.65,
                          margin: 0,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: god.augment.description
                            .replace(
                              /(\d+(?:\.\d+)?%)/g,
                              `<span style="color:${TFT.gold};font-weight:700;">$1</span>`
                            )
                            .replace(
                              /(\d+\s*giây)/gi,
                              `<span style="color:${TFT.gold};font-weight:700;">$1</span>`
                            ),
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stages */}
              {god.stages && god.stages.length > 0 && (
                <div>
                  <SectionTitle>Phần Thưởng Giai Đoạn</SectionTitle>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: "16px",
                      background: TFT.panelSoft,
                      border: `1px solid ${TFT.lineSoft}`,
                      borderTop: "none",
                    }}
                  >
                    {god.stages.map((stageObj, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: TFT.panel,
                          border: `1px solid ${TFT.lineSoft}`,
                        }}
                      >
                        <div
                          className="tft-heading"
                          style={{
                            padding: "8px 14px",
                            fontSize: 11,
                            fontWeight: 700,
                            color: TFT.gold,
                            textTransform: "uppercase",
                            letterSpacing: "0.14em",
                            background: `linear-gradient(180deg, ${TFT.panelAlt} 0%, ${TFT.panel} 100%)`,
                            borderBottom: `1px solid ${TFT.lineSoft}`,
                          }}
                        >
                          {stageObj.stage}
                        </div>
                        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                          {stageObj.rewards.map((reward, rIdx) => {
                            const parts = reward.text.split(": ");
                            const hasTitle = parts.length > 1;
                            return (
                              <div
                                key={rIdx}
                                style={{
                                  display: "flex",
                                  gap: 12,
                                  alignItems: "center",
                                }}
                              >
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    position: "relative",
                                    background: "#000",
                                    flexShrink: 0,
                                    boxShadow: tftBevel(TFT.goldDim, false),
                                  }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    loading="lazy"
                                    src={reward.icon}
                                    alt=""
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      imageRendering: "pixelated",
                                    }}
                                  />
                                </div>
                                <div style={{ fontSize: 12, color: TFT.text, lineHeight: 1.5 }}>
                                  {hasTitle ? (
                                    <>
                                      <span
                                        style={{
                                          color: TFT.blueBright,
                                          fontWeight: 700,
                                        }}
                                      >
                                        {parts[0]}:
                                      </span>{" "}
                                      {parts.slice(1).join(": ")}
                                    </>
                                  ) : (
                                    reward.text
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: TFT.bad,
              fontSize: 13,
              letterSpacing: "0.04em",
            }}
          >
            Không tìm thấy dữ liệu.
          </div>
        )}
      </div>
    </div>
  );
}
