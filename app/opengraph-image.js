import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "rosereader website preview";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d0f14",
          backgroundImage: "radial-gradient(rgba(90, 105, 138, 0.34) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          padding: 56
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 34,
            background: "rgba(13, 15, 20, 0.84)",
            border: "1px solid #2d3340",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: 22,
            padding: "58px 74px"
          }}
        >
          <div style={{ fontSize: 74, lineHeight: 1 }}>🌹</div>
          <div
            style={{
              fontSize: 62,
              lineHeight: 1.05,
              fontWeight: 700,
              color: "#f1f3f6",
              letterSpacing: -1
            }}
          >
            Every One Should See This
          </div>
          <div
            style={{
              maxWidth: 880,
              fontSize: 30,
              lineHeight: 1.35,
              color: "#bac2d2"
            }}
          >
            Important ideas, translated into many languages so more people can access them.
          </div>
        </div>
      </div>
    ),
    size
  );
}
