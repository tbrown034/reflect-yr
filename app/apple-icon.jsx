// app/apple-icon.jsx
// Apple touch icon for iOS home screen
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          borderRadius: 36,
        }}
      >
        {/* Compact logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 48,
              fontWeight: 400,
              color: "#64748b",
            }}
          >
            (
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 48,
              fontWeight: 700,
              color: "#2563eb",
            }}
          >
            id
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 48,
              fontWeight: 400,
              color: "#64748b",
            }}
          >
            )
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
