import { ImageResponse } from "next/og";

// app/apple-icon.tsx — Tạo apple-touch-icon 180x180
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 36,
          background: "linear-gradient(135deg, #f0b90b 0%, #d4a017 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#000",
          fontSize: 96,
          fontWeight: 900,
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
