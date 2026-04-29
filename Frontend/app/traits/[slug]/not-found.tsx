import Link from "next/link";

export default function TraitNotFound() {
  return (
    <div style={{ background: "#111111", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#ffffff", margin: "0 0 8px" }}>
          Không tìm thấy Tộc/Hệ
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 20px" }}>
          Tộc/Hệ này không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/traits"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 18px", borderRadius: 8,
            background: "#1e1e1e", border: "1px solid #333",
            fontSize: 13, color: "#e5e7eb", textDecoration: "none",
          }}
        >
          ← Xem danh sách Tộc &amp; Hệ
        </Link>
      </div>
    </div>
  );
}
