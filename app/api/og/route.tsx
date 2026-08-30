import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0f3d22 0%, #166534 50%, #14532d 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ fontSize: "72px", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1 }}>
            Invoala
          </div>
          <div style={{ fontSize: "28px", fontWeight: 500, marginTop: "16px", color: "#bbf7d0" }}>
            Free Invoice Generator for Freelancers
          </div>
          <div style={{ fontSize: "20px", marginTop: "12px", color: "#86efac" }}>
            Professional invoices in seconds. No sign-up. No watermark.
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    }
  );
}
