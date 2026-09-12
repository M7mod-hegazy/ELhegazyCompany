import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "شركة الحجازي للحلول البرمجية ونقاط البيع | ElHegazi Tech";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0A0B 0%, #17171C 100%)",
          color: "#EDE7DA",
          padding: "60px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "1px solid rgba(201, 168, 106, 0.3)",
            borderRadius: "16px",
          }}
        />
        <div
          style={{
            fontSize: "22px",
            letterSpacing: "6px",
            color: "#C9A86A",
            textTransform: "uppercase",
            marginBottom: "16px",
            fontWeight: 600,
          }}
        >
          ELHEGAZI TECH
        </div>
        <div
          style={{
            fontSize: "52px",
            fontWeight: "bold",
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          شركة الحجازي للحلول البرمجية
        </div>
        <div
          style={{
            fontSize: "26px",
            color: "#C9A86A",
            textAlign: "center",
            marginBottom: "36px",
          }}
        >
          أنظمة نقاط البيع (POS) · المتاجر الإلكترونية · التسويق الرقمي
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 36px",
            background: "rgba(201, 168, 106, 0.15)",
            border: "1px solid #C9A86A",
            borderRadius: "9999px",
            fontSize: "20px",
            color: "#EDE7DA",
          }}
        >
          elhegazi-tech.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
