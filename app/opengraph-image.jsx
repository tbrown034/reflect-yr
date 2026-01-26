// app/opengraph-image.jsx
// Dynamic OG image generation for social sharing
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "sort(id) - Rank Your Favorites";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 120,
              fontWeight: 600,
              color: "#f8fafc",
              letterSpacing: "-0.02em",
            }}
          >
            sort
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 120,
              fontWeight: 400,
              color: "#64748b",
            }}
          >
            (
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 120,
              fontWeight: 700,
              color: "#2563eb",
            }}
          >
            id
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 120,
              fontWeight: 400,
              color: "#64748b",
            }}
          >
            )
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: "#94a3b8",
            marginTop: 8,
          }}
        >
          Rank your favorites. Share your taste.
        </div>

        {/* Decorative elements - small colored bars */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 48,
          }}
        >
          <div
            style={{
              width: 60,
              height: 6,
              backgroundColor: "#2563eb",
              borderRadius: 3,
            }}
          />
          <div
            style={{
              width: 40,
              height: 6,
              backgroundColor: "#64748b",
              borderRadius: 3,
            }}
          />
          <div
            style={{
              width: 20,
              height: 6,
              backgroundColor: "#334155",
              borderRadius: 3,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
