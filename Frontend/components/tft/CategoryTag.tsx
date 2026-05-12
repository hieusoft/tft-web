"use client";

import { TFT } from "@/lib/tft-theme";

/** Category tag (Ánh Sáng, Tạo Tác, Hỗ Trợ, Thường, ...) — outline style nhỏ gọn, uppercase. */
export default function CategoryTag({ category, size = "md" }: { category: string; size?: "sm" | "md" }) {
  let color: string = TFT.textDim;
  if (category.includes("Ánh Sáng")) color = "#fde047";
  else if (category.includes("Tạo Tác")) color = "#f87171";
  else if (category.includes("Hỗ Trợ")) color = "#60a5fa";
  else if (category.includes("Tộc/Hệ") || category.includes("Ấn")) color = "#2dd4bf";
  else if (category.includes("Biểu Tượng")) color = "#a78bfa";
  else if (category.includes("Thường")) color = TFT.gold;

  const isMd = size === "md";
  return (
    <span
      style={{
        display: "inline-block",
        padding: isMd ? "3px 10px" : "2px 7px",
        fontSize: isMd ? 10 : 9,
        fontWeight: 700,
        color,
        border: `1px solid ${color}55`,
        background: `${color}11`,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        whiteSpace: "nowrap",
      }}
    >
      {category}
    </span>
  );
}
